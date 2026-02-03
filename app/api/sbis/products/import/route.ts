import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { Product } from '@/data/products'
import { getSBISPrices } from '@/lib/sbis-prices'
import {
  getSBISStock,
  getSBISCompanies,
  getSBISCompanyWarehouses
} from '@/lib/sbis-stock'
import {
  detectCategory,
  detectSubcategory,
  generateProductId,
  generateDescription,
  generateFeatures
} from '@/lib/product-categorizer'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const productsJsonPath = join(process.cwd(), 'data', 'products.json')

/**
 * API endpoint для автоматической загрузки всех товаров со склада "Толстого 32А"
 * 
 * Использование:
 * POST /api/sbis/products/import
 * 
 * Body (опционально):
 * {
 *   "priceListId": 15,  // ID прайс-листа (если не указан, используется из env)
 *   "warehouseName": "Филиал в г. Владивосток", // Название склада
 *   "force": false      // Перезаписать существующие товары
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    
    const SBIS_PRICE_LIST_ID = parseInt(process.env.SBIS_PRICE_LIST_ID || body.priceListId || '15')
    const SBIS_WAREHOUSE_NAME = process.env.SBIS_WAREHOUSE_NAME || body.warehouseName || 'Филиал в г. Владивосток'
    const force = body.force || false

    console.log('[SBIS Import] Начало автоматической загрузки товаров...')
    console.log(`[SBIS Import] Прайс-лист: ${SBIS_PRICE_LIST_ID}, Склад: ${SBIS_WAREHOUSE_NAME}`)

    // 1. Получаем список компаний
    console.log('[SBIS Import] Получение списка компаний...')
    const companies = await getSBISCompanies()
    if (companies.length === 0) {
      throw new Error('Не найдено компаний в СБИС')
    }
    
    const companyId = companies[0].id
    console.log(`[SBIS Import] Используется компания: ${companies[0].name} (ID: ${companyId})`)
    
    // 2. Получаем список складов компании
    console.log(`[SBIS Import] Получение списка складов компании ${companyId}...`)
    const warehouses = await getSBISCompanyWarehouses(companyId)
    
    // Ищем склад по названию
    let warehouse = warehouses.find(w => 
      w.name.toLowerCase().includes(SBIS_WAREHOUSE_NAME.toLowerCase()) ||
      SBIS_WAREHOUSE_NAME.toLowerCase().includes(w.name.toLowerCase())
    )
    
    // Если не нашли, ищем по адресу
    if (!warehouse) {
      warehouse = warehouses.find(w => {
        const address = (w as any).address || ''
        return address.toLowerCase().includes('толстого') || 
               address.toLowerCase().includes('32')
      })
    }
    
    if (!warehouse) {
      throw new Error(`Склад "${SBIS_WAREHOUSE_NAME}" не найден. Доступные склады: ${warehouses.map(w => w.name).join(', ')}`)
    }
    
    console.log(`[SBIS Import] Найден склад: ${warehouse.name} (ID: ${warehouse.id})`)
    
    // 3. Загружаем все товары из прайс-листа (без pointId, чтобы получить все товары)
    console.log(`[SBIS Import] Загрузка товаров из прайс-листа ${SBIS_PRICE_LIST_ID}...`)
    
    // Загружаем товары порциями по 1000 (максимум для API v2)
    let allProducts: Array<{ id: string | number; name: string; price: number; code?: string; article?: string; balance?: string | number }> = []
    let hasMore = true
    let pageCount = 0
    const maxPages = 100 // Ограничение на 100 страниц (100,000 товаров максимум)
    
    while (hasMore && pageCount < maxPages) {
      const pricesResponse = await getSBISPrices(
        SBIS_PRICE_LIST_ID,
        0, // pointId не используется
        undefined, // actualDate
        undefined, // searchString - получаем все товары
        undefined, // page
        1000 // pageSize - максимум
      )
      
      allProducts = [...allProducts, ...pricesResponse.items]
      hasMore = pricesResponse.hasMore
      pageCount++
      
      console.log(`[SBIS Import] Страница ${pageCount}: загружено ${pricesResponse.items.length} товаров (всего: ${allProducts.length})`)
      
      // Небольшая задержка между запросами, чтобы не перегружать API
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    console.log(`[SBIS Import] Всего загружено товаров: ${allProducts.length}`)
    
    // 4. Получаем остатки товаров на складе
    console.log(`[SBIS Import] Получение остатков товаров на складе ${warehouse.id}...`)
    const stockResponse = await getSBISStock(
      [SBIS_PRICE_LIST_ID], // priceListIds
      undefined, // nomenclatures
      [warehouse.id], // warehouses
      [companyId] // companies
    )
    
    const stockMap = new Map<number, number>()
    for (const item of stockResponse.items) {
      stockMap.set(Number(item.id), item.stock)
    }
    
    console.log(`[SBIS Import] Получено остатков: ${stockMap.size}`)
    
    // 5. Загружаем существующие товары
    let existingProducts: Product[] = []
    try {
      const content = await readFile(productsJsonPath, 'utf-8')
      existingProducts = JSON.parse(content)
    } catch {
      existingProducts = []
    }
    
    console.log(`[SBIS Import] Существующих товаров: ${existingProducts.length}`)
    
    // 6. Создаем/обновляем товары
    const now = new Date().toISOString()
    const createdProducts: Product[] = []
    const updatedProducts: Product[] = []
    const skippedProducts: string[] = []
    
    for (const sbisProduct of allProducts) {
      // Пропускаем папки/категории (товары без цены)
      if (!sbisProduct.price || sbisProduct.price <= 0) {
        continue
      }
      
      // Определяем категорию и подкатегорию
      const category = detectCategory(sbisProduct.name)
      const subcategory = detectSubcategory(sbisProduct.name, category)
      
      // Генерируем ID товара
      const productId = generateProductId(sbisProduct.name, sbisProduct.code)
      
      // Проверяем, существует ли товар
      const existingProduct = existingProducts.find(p => 
        p.id === productId || 
        p.sbisId === sbisProduct.id || 
        (sbisProduct.code && p.sbisId === sbisProduct.code)
      )
      
      // Получаем остаток
      const stock = stockMap.get(Number(sbisProduct.id)) || 0
      
      const productData: Product = {
        id: productId,
        name: sbisProduct.name,
        category,
        subcategory,
        price: sbisProduct.price,
        description: existingProduct?.description || generateDescription(sbisProduct.name, category),
        features: existingProduct?.features || generateFeatures(sbisProduct.name, category),
        specifications: existingProduct?.specifications || {},
        // СБИС данные
        sbisId: sbisProduct.code || String(sbisProduct.id),
        sbisPriceListId: SBIS_PRICE_LIST_ID,
        priceUpdatedAt: now,
        stock: stock,
        inStock: stock > 0,
        stockUpdatedAt: now,
        sbisWarehouseId: warehouse.uuid || String(warehouse.id),
        // Сохраняем изображение, если было
        image: existingProduct?.image,
        images: existingProduct?.images
      }
      
      if (existingProduct) {
        if (force) {
          // Обновляем существующий товар
          const index = existingProducts.findIndex(p => p.id === productId)
          existingProducts[index] = productData
          updatedProducts.push(productData)
        } else {
          // Обновляем только цены и остатки
          const index = existingProducts.findIndex(p => p.id === productId)
          existingProducts[index] = {
            ...existingProducts[index],
            price: productData.price,
            stock: productData.stock,
            inStock: productData.inStock,
            priceUpdatedAt: productData.priceUpdatedAt,
            stockUpdatedAt: productData.stockUpdatedAt,
            sbisId: productData.sbisId,
            sbisPriceListId: productData.sbisPriceListId,
            sbisWarehouseId: productData.sbisWarehouseId
          }
          updatedProducts.push(existingProducts[index])
        }
      } else {
        // Создаем новый товар
        existingProducts.push(productData)
        createdProducts.push(productData)
      }
    }
    
    // 7. Сохраняем товары
    await writeFile(productsJsonPath, JSON.stringify(existingProducts, null, 2), 'utf-8')
    
    console.log(`[SBIS Import] Импорт завершен:`)
    console.log(`[SBIS Import] - Создано товаров: ${createdProducts.length}`)
    console.log(`[SBIS Import] - Обновлено товаров: ${updatedProducts.length}`)
    
    // Статистика по категориям
    const categoryStats: Record<string, number> = {}
    for (const product of [...createdProducts, ...updatedProducts]) {
      categoryStats[product.category] = (categoryStats[product.category] || 0) + 1
    }
    
    return NextResponse.json({
      success: true,
      message: 'Товары успешно импортированы',
      stats: {
        total: allProducts.length,
        created: createdProducts.length,
        updated: updatedProducts.length,
        skipped: skippedProducts.length,
        categories: categoryStats,
        warehouse: {
          id: warehouse.id,
          name: warehouse.name,
          uuid: warehouse.uuid
        },
        priceListId: SBIS_PRICE_LIST_ID,
        importedAt: now
      }
    })
  } catch (error) {
    console.error('[SBIS Import] Ошибка импорта товаров:', error)
    return NextResponse.json(
      { 
        error: 'Ошибка импорта товаров',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    )
  }
}
