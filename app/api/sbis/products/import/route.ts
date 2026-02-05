import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { Product } from '@/data/products'
import { getSBISPrices, getSBISPricesV1 } from '@/lib/sbis-prices'
import {
  getSBISStock,
  getSBISCompanies,
  getSBISCompanyWarehouses,
  getSBISPoints
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
 * GET или POST /api/sbis/products/import
 * 
 * Body (опционально для POST):
 * {
 *   "priceListId": 15,  // ID прайс-листа (если не указан, используется из env)
 *   "warehouseName": "Филиал в г. Владивосток", // Название склада
 *   "force": false      // Перезаписать существующие товары
 * }
 */

// GET запрос для удобства тестирования через браузер
export async function GET(request: NextRequest) {
  return handleImport({})
}

// POST запрос с возможностью передать параметры
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return handleImport(body)
}

async function handleImport(body: { priceListId?: number; warehouseName?: string; force?: boolean }) {
  try {
    
    const SBIS_PRICE_LIST_ID = parseInt(process.env.SBIS_PRICE_LIST_ID || body.priceListId || '15')
    const force = body.force || false

    console.log('[SBIS Import] Начало автоматической загрузки товаров...')
    console.log(`[SBIS Import] Прайс-лист: ${SBIS_PRICE_LIST_ID}`)
    console.log(`[SBIS Import] Ищем склады: "Филиал в г. Владивосток" и "Инженерный"`)

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
    
    // Ищем конкретные склады по названию: "Филиал в г. Владивосток" и "Инженерный"
    const targetWarehouseNames = ['Филиал в г. Владивосток', 'Инженерный']
    const targetWarehouses = warehouses.filter(w => {
      // Точное совпадение по названию
      return targetWarehouseNames.includes(w.name)
    })
    
    if (targetWarehouses.length === 0) {
      throw new Error(`Склады "${targetWarehouseNames.join('" и "')}" не найдены. Доступные склады: ${warehouses.map(w => w.name).join(', ')}`)
    }
    
    console.log(`[SBIS Import] Найдено складов: ${targetWarehouses.length}`)
    for (const wh of targetWarehouses) {
      console.log(`[SBIS Import] - ${wh.name} (ID: ${wh.id}, адрес: ${(wh as any).address || 'не указан'})`)
    }
    
    // ВАЖНО: pointId - это ID точки продаж, а не склада!
    // Для получения товаров не используем pointId (получаем все товары из прайс-листа)
    // Для получения остатков используем ID складов в отдельном запросе
    const warehouseIds = targetWarehouses.map(w => w.id) // ID всех складов для получения остатков
    const primaryWarehouse = targetWarehouses[0] // Первый склад для сохранения в sbisWarehouseId
    
    console.log(`[SBIS Import] Склады для получения остатков: ${targetWarehouses.map(w => `${w.name} (${w.id})`).join(', ')}`)
    
    // 2.5. Получаем точки продаж (pointId нужен для API v1)
    console.log(`[SBIS Import] Получение списка точек продаж...`)
    let pointId: number | undefined = undefined
    try {
      const points = await getSBISPoints()
      if (points.length > 0) {
        pointId = points[0].id
        console.log(`[SBIS Import] Найдено точек продаж: ${points.length}`)
        for (const point of points) {
          console.log(`[SBIS Import] - ${point.name} (ID: ${point.id}, адрес: ${point.address || 'не указан'})`)
        }
      } else {
        console.log(`[SBIS Import] Точки продаж не найдены, продолжаем без pointId`)
      }
    } catch (error) {
      console.warn(`[SBIS Import] Не удалось получить точки продаж:`, error)
    }
    
    // 3. Загружаем ВСЕ товары
    // Пробуем разные методы:
    // - API v1 с pointId (если есть точка продаж) - должен работать для иерархии
    // - API v2 каталог
    // - API v2 прайс-лист
    console.log(`[SBIS Import] Загрузка товаров (pointId=${pointId || 'нет'})...`)
    
    let allProducts: Array<{ id: string | number; name: string; price: number; code?: string; article?: string; balance?: string | number }> = []
    let totalApiCalls = 0
    
    // Общие переменные для пагинации (определяем ДО всех методов)
    const maxPages = 500 // Для 10773 товаров нужно ~11 страниц по 1000
    
    // Метод 0: API v1 с pointId (если есть точка продаж)
    // Этот API должен возвращать ВСЕ товары из прайс-листа, включая вложенные в папки
    if (pointId) {
      console.log(`[SBIS Import] Метод 0: Загрузка через API v1 с pointId=${pointId}, priceListId=${SBIS_PRICE_LIST_ID}...`)
      let page = 0
      let hasMore = true
      
      while (hasMore && page < maxPages) {
        try {
          totalApiCalls++
          const response = await getSBISPricesV1(
            pointId,
            SBIS_PRICE_LIST_ID,
            page,
            1000
          )
          
          allProducts = [...allProducts, ...response.items]
          
          console.log(`[SBIS Import] API v1 стр.${page + 1}: товаров=${response.items.length}, всего=${allProducts.length}, hasMore=${response.hasMore}`)
          
          hasMore = response.hasMore || response.items.length === 1000
          if (hasMore && response.items.length > 0) {
            page++
            await new Promise(resolve => setTimeout(resolve, 300))
          } else {
            hasMore = false
          }
        } catch (error) {
          console.warn(`[SBIS Import] Ошибка API v1 на странице ${page}:`, error)
          break
        }
      }
      
      console.log(`[SBIS Import] API v1 завершён: ${allProducts.length} товаров`)
    }
    
    // Если API v1 дал мало результатов, пробуем API v2
    if (allProducts.length < 100) {
      console.log(`[SBIS Import] API v1 дал мало результатов (${allProducts.length}), пробуем API v2...`)
      allProducts = []
    }
    
    // Метод 1: Рекурсивный обход папок через position
    if (allProducts.length < 100) {
      console.log(`[SBIS Import] Метод 1: Рекурсивный обход папок через position...`)
      
      const processedFolders = new Set<number>()
      const folderQueue: Array<{ hierarchicalId: number; name: string; depth: number }> = []
      
      // Функция для рекурсивной загрузки из папки
      async function loadFromFolder(folderId: number | undefined, folderName: string, depth: number = 0): Promise<void> {
        if (folderId !== undefined && processedFolders.has(folderId)) {
          return // Уже обработали эту папку
        }
        if (folderId !== undefined) {
          processedFolders.add(folderId)
        }
        
        const indent = '  '.repeat(Math.min(depth, 3))
        console.log(`${indent}[SBIS Import] Загрузка из "${folderName}" (id=${folderId || 'root'}, глубина=${depth})...`)
        
        let lastPosition: number | undefined = folderId // Начинаем с ID папки
        let hasMore = true
        let pageCount = 0
        const maxPagesPerFolder = 50
        
        while (hasMore && pageCount < maxPagesPerFolder) {
          let response
          let retryCount = 0
          const maxRetries = 3
          
          while (retryCount < maxRetries) {
            try {
              totalApiCalls++
              response = await getSBISPrices(
                SBIS_PRICE_LIST_ID, // Используем прайс-лист
                0,
                undefined,
                undefined,
                undefined,
                1000,
                lastPosition
              )
              break
            } catch (error: any) {
              retryCount++
              if (retryCount >= maxRetries) {
                console.error(`${indent}[SBIS Import] Ошибка после ${maxRetries} попыток:`, error)
                return
              }
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
            }
          }
          
          if (!response) break
          
          // Фильтруем товары (не папки)
          const productsOnPage = response.items.filter(item => !('isParent' in item && (item as any).isParent))
          allProducts = [...allProducts, ...productsOnPage]
          
          // Добавляем найденные папки в очередь для обработки
          if (response.folders && response.folders.length > 0) {
            for (const folder of response.folders) {
              if (!processedFolders.has(folder.hierarchicalId)) {
                folderQueue.push({
                  hierarchicalId: folder.hierarchicalId,
                  name: folder.name,
                  depth: depth + 1
                })
              }
            }
          }
          
          console.log(`${indent}[SBIS Import] Стр.${pageCount + 1}: товаров=${productsOnPage.length}, папок=${response.folders?.length || 0}, всего=${allProducts.length}`)
          
          // Обновляем position
          if (response.lastPosition && response.lastPosition !== lastPosition) {
            lastPosition = response.lastPosition
            hasMore = true
            pageCount++
            await new Promise(resolve => setTimeout(resolve, 200))
          } else {
            hasMore = false
          }
        }
      }
      
      // Начинаем с корня
      await loadFromFolder(undefined, 'Корень', 0)
      
      // Обрабатываем очередь папок
      while (folderQueue.length > 0 && allProducts.length < 50000) {
        const folder = folderQueue.shift()!
        await loadFromFolder(folder.hierarchicalId, folder.name, folder.depth)
        await new Promise(resolve => setTimeout(resolve, 100)) // Небольшая задержка между папками
      }
      
      console.log(`[SBIS Import] Рекурсивный обход завершён: ${allProducts.length} товаров, обработано папок: ${processedFolders.size}`)
    }
    
    // Метод 2: Если position-пагинация дала мало результатов, пробуем page
    if (allProducts.length < 100) {
      console.log(`[SBIS Import] Метод 2: Загрузка из каталога через page-пагинацию...`)
      allProducts = []
      let page = 0
      let hasMore = true
      
      while (hasMore && page < maxPages) {
        let response
        let retryCount = 0
        const maxRetries = 3
        
        while (retryCount < maxRetries) {
          try {
            totalApiCalls++
            response = await getSBISPrices(
              0, // каталог
              0,
              undefined,
              undefined,
              page,
              1000
            )
            break
          } catch (error: any) {
            retryCount++
            if (retryCount >= maxRetries) throw error
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
          }
        }
        
        if (!response) break
        
        const productsOnPage = response.items.filter(item => !('isParent' in item && (item as any).isParent))
        allProducts = [...allProducts, ...productsOnPage]
        
        console.log(`[SBIS Import] Page ${page}: товаров=${productsOnPage.length}, всего=${allProducts.length}`)
        
        hasMore = response.hasMore || response.items.length === 1000
        if (hasMore && response.items.length > 0) {
          page++
          await new Promise(resolve => setTimeout(resolve, 300))
        } else {
          hasMore = false
        }
      }
    }
    
    // Метод 3: Если каталог пустой, пробуем прайс-лист
    if (allProducts.length < 100) {
      console.log(`[SBIS Import] Метод 3: Загрузка из прайс-листа ${SBIS_PRICE_LIST_ID}...`)
      allProducts = []
      let lastPosition: number | undefined = undefined
      let hasMore = true
      let pageCount = 0
      
      while (hasMore && pageCount < maxPages) {
        let response
        try {
          totalApiCalls++
          response = await getSBISPrices(
            SBIS_PRICE_LIST_ID,
            0,
            undefined,
            undefined,
            undefined,
            1000,
            lastPosition
          )
        } catch (error) {
          console.error(`[SBIS Import] Ошибка:`, error)
          break
        }
        
        const productsOnPage = response.items.filter(item => !('isParent' in item && (item as any).isParent))
        allProducts = [...allProducts, ...productsOnPage]
        
        console.log(`[SBIS Import] Прайс стр.${pageCount + 1}: товаров=${productsOnPage.length}, всего=${allProducts.length}`)
        
        if (response.lastPosition && response.lastPosition !== lastPosition) {
          lastPosition = response.lastPosition
          hasMore = true
          pageCount++
          await new Promise(resolve => setTimeout(resolve, 300))
        } else {
          hasMore = false
        }
      }
    }
    
    console.log(`[SBIS Import] Загрузка завершена:`)
    console.log(`[SBIS Import] - Всего товаров: ${allProducts.length}`)
    console.log(`[SBIS Import] - API вызовов: ${totalApiCalls}`)
    
    // 4. Получаем остатки товаров со всех складов "Толстого 32А"
    console.log(`[SBIS Import] Получение остатков товаров со складов: ${targetWarehouses.map(w => w.name).join(', ')}...`)
    console.log(`[SBIS Import] ID складов для остатков: ${warehouseIds.join(', ')}`)
    
    // Получаем остатки со всех целевых складов (warehouseIds уже определен выше на строке 81)
    const stockResponse = await getSBISStock(
      [SBIS_PRICE_LIST_ID], // priceListIds
      undefined, // nomenclatures
      warehouseIds, // warehouses - все склады "Толстого 32А"
      [companyId] // companies
    )
    
    // Суммируем остатки по всем складам для каждого товара
    const stockMap = new Map<number, number>()
    for (const item of stockResponse.items) {
      const productId = Number(item.id)
      const currentStock = stockMap.get(productId) || 0
      stockMap.set(productId, currentStock + item.stock)
    }
    
    console.log(`[SBIS Import] Получено остатков (сумма по всем складам): ${stockMap.size}`)
    
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
    
    console.log(`[SBIS Import] Начинаем обработку ${allProducts.length} товаров из СБИС...`)
    let processedCount = 0
    let skippedNoPrice = 0
    
    // ВАЖНО: Удаляем дубликаты из allProducts перед обработкой
    // Используем Set для отслеживания уникальных товаров по ID или коду
    const uniqueProducts = new Map<string | number, typeof allProducts[0]>()
    for (const sbisProduct of allProducts) {
      // Используем ID или код как ключ для уникальности
      const key = sbisProduct.code || sbisProduct.id
      if (!uniqueProducts.has(key)) {
        uniqueProducts.set(key, sbisProduct)
      }
    }
    const deduplicatedProducts = Array.from(uniqueProducts.values())
    console.log(`[SBIS Import] После удаления дубликатов: ${deduplicatedProducts.length} уникальных товаров (было: ${allProducts.length})`)
    
    for (const sbisProduct of deduplicatedProducts) {
      processedCount++
      
      // Пропускаем папки/категории (товары без цены)
      if (!sbisProduct.price || sbisProduct.price <= 0) {
        skippedNoPrice++
        if (processedCount <= 10 || processedCount % 50 === 0) {
          console.log(`[SBIS Import] Пропущен товар без цены: ${sbisProduct.name} (цена: ${sbisProduct.price}, ${processedCount}/${deduplicatedProducts.length})`)
        }
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
        p.sbisId === String(sbisProduct.id) || 
        (sbisProduct.code && p.sbisId === sbisProduct.code) ||
        (sbisProduct.code && p.sbisId === String(sbisProduct.id))
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
        sbisWarehouseId: primaryWarehouse.uuid || String(primaryWarehouse.id), // Сохраняем ID основного склада
        // Сохраняем изображение, если было
        image: existingProduct?.image,
        images: existingProduct?.images
      }
      
      if (existingProduct) {
        // Обновляем существующий товар
        const index = existingProducts.findIndex(p => p.id === productId)
        if (index === -1) {
          console.error(`[SBIS Import] ОШИБКА: Товар найден, но индекс не найден: ${productId}`)
          // Если индекс не найден, создаем новый товар
          existingProducts.push(productData)
          createdProducts.push(productData)
        } else {
          if (force) {
            // Обновляем существующий товар полностью
            existingProducts[index] = productData
            updatedProducts.push(productData)
          } else {
            // Обновляем только цены и остатки
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
        }
      } else {
        // Создаем новый товар
        existingProducts.push(productData)
        createdProducts.push(productData)
        if (createdProducts.length <= 10 || createdProducts.length % 10 === 0) {
          console.log(`[SBIS Import] Создан новый товар #${createdProducts.length}: ${productData.name} (ID: ${productId}, цена: ${productData.price}, категория: ${category})`)
        }
      }
      
      // Логируем каждые 50 обработанных товаров
      if (processedCount % 50 === 0) {
        console.log(`[SBIS Import] Обработано: ${processedCount}/${deduplicatedProducts.length}, создано: ${createdProducts.length}, обновлено: ${updatedProducts.length}, пропущено без цены: ${skippedNoPrice}`)
      }
    }
    
    // 7. Сохраняем товары
    console.log(`[SBIS Import] Сохранение товаров в файл: ${productsJsonPath}`)
    console.log(`[SBIS Import] Всего товаров для сохранения: ${existingProducts.length}`)
    console.log(`[SBIS Import] - Создано новых: ${createdProducts.length}`)
    console.log(`[SBIS Import] - Обновлено существующих: ${updatedProducts.length}`)
    console.log(`[SBIS Import] - Пропущено без цены: ${skippedNoPrice}`)
    
    try {
      await writeFile(productsJsonPath, JSON.stringify(existingProducts, null, 2), 'utf-8')
      console.log(`[SBIS Import] Файл успешно сохранен: ${productsJsonPath}`)
      console.log(`[SBIS Import] Размер файла: ${JSON.stringify(existingProducts).length} байт`)
    } catch (error) {
      console.error(`[SBIS Import] ОШИБКА при сохранении файла:`, error)
      throw error
    }
    
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
        unique: deduplicatedProducts.length,
        created: createdProducts.length,
        updated: updatedProducts.length,
        skipped: skippedNoPrice,
        skippedNoPrice: skippedNoPrice,
        categories: categoryStats,
        warehouses: targetWarehouses.map(w => ({
          id: w.id,
          name: w.name,
          uuid: w.uuid,
          address: (w as any).address
        })),
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
