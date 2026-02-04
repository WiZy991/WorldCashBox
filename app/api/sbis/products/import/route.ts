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
    
    // 3. Загружаем все товары из прайс-листа (без pointId, так как это ID точки продаж, а не склада)
    // Остатки получаем отдельно по ID складов
    console.log(`[SBIS Import] Загрузка товаров из прайс-листа ${SBIS_PRICE_LIST_ID}...`)
    
    // Загружаем товары порциями по 1000 (максимум для API v2)
    // ВАЖНО: Используем комбинированный подход - сначала пробуем position (иерархический),
    // если position не работает (возвращает пустой объект), переключаемся на page
    let allProducts: Array<{ id: string | number; name: string; price: number; code?: string; article?: string; balance?: string | number }> = []
    let pageCount = 0
    let lastPosition: number | undefined = undefined
    const maxPages = 200 // Ограничение на 200 страниц (200,000 товаров максимум)
    let currentPage = 0 // Для пагинации по page, если position не работает
    let usePositionPagination = true // Флаг: использовать position или page
    let duplicatePageCount = 0 // Счетчик дублирующихся страниц
    let lastPageItemsCount = 0 // Количество товаров на предыдущей странице
    let lastPagePosition: number | undefined = undefined // lastPosition предыдущей страницы
    
    // Продолжаем загрузку пока есть lastPosition или hasMore
    while (pageCount < maxPages) {
      // ВАЖНО: pointId - это ID точки продаж, а не склада!
      // Не передаем pointId, так как ID склада не является точкой продаж
      // Товары получаем без pointId, остатки получаем отдельно по ID складов
      let pricesResponse
      let retryCount = 0
      const maxRetries = 3
      
      // Повторяем запрос при ошибках с экспоненциальной задержкой
      while (retryCount < maxRetries) {
        try {
          pricesResponse = await getSBISPrices(
            SBIS_PRICE_LIST_ID,
            0, // pointId не используется (ID склада не является точкой продаж)
            undefined, // actualDate
            undefined, // searchString - получаем все товары
            usePositionPagination ? undefined : currentPage, // page для пагинации (если не используем position)
            1000, // pageSize - максимум
            usePositionPagination ? lastPosition : undefined // position для пагинации (приоритет над page)
          )
          break // Успешно получили ответ
        } catch (error: any) {
          retryCount++
          if (retryCount >= maxRetries) {
            console.error(`[SBIS Import] Ошибка после ${maxRetries} попыток:`, error)
            throw error
          }
          // Экспоненциальная задержка: 2s, 4s, 8s
          const delay = Math.pow(2, retryCount) * 1000
          console.warn(`[SBIS Import] Ошибка при запросе (попытка ${retryCount}/${maxRetries}), повтор через ${delay}ms:`, error.message || error)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
      
      if (!pricesResponse) {
        throw new Error('Не удалось получить ответ от API после всех попыток')
      }
      
      allProducts = [...allProducts, ...pricesResponse.items]
      const newLastPosition = pricesResponse.lastPosition // Сохраняем position для следующей страницы
      
      pageCount++
      
      // Проверяем, не получаем ли мы одни и те же данные (дубликаты)
      if (!usePositionPagination && pricesResponse.items.length === lastPageItemsCount && newLastPosition === lastPagePosition) {
        duplicatePageCount++
        console.warn(`[SBIS Import] ВНИМАНИЕ: Получены одинаковые данные на странице ${pageCount} (товаров: ${pricesResponse.items.length}, lastPosition: ${newLastPosition}). Дубликат #${duplicatePageCount}`)
        
        // Если получили одинаковые данные 3 раза подряд, прекращаем загрузку
        if (duplicatePageCount >= 3) {
          console.error(`[SBIS Import] Получены одинаковые данные ${duplicatePageCount} раз подряд. API не возвращает новые товары. Прекращаем загрузку.`)
          console.log(`[SBIS Import] Всего загружено уникальных товаров: ${allProducts.length}`)
          break
        }
      } else {
        // Если получили новые данные, сбрасываем счетчик дубликатов
        duplicatePageCount = 0
      }
      
      lastPageItemsCount = pricesResponse.items.length
      lastPagePosition = newLastPosition
      
      console.log(`[SBIS Import] Страница ${pageCount}: загружено ${pricesResponse.items.length} товаров (всего: ${allProducts.length}), hasMore: ${pricesResponse.hasMore}, lastPosition: ${newLastPosition}, page: ${currentPage}, usePosition: ${usePositionPagination}`)
      
      // ВАЖНО: Если получили 0 товаров и пустой объект {}, это может означать:
      // 1. Конец иерархии при использовании position (но могут быть товары в других папках через page)
      // 2. Конец данных при использовании page
      // Если используем position и получили 0 товаров без newLastPosition, переключаемся на page
      if (pricesResponse.items.length === 0 && !newLastPosition && usePositionPagination) {
        console.log(`[SBIS Import] Получено 0 товаров при использовании position, переключаемся на page для получения товаров из всех папок...`)
        usePositionPagination = false
        lastPosition = undefined
        currentPage = 0 // Начинаем с первой страницы при использовании page
        continue // Повторяем запрос с page вместо position
      }
      
      // ВАЖНО: Продолжаем загрузку если есть newLastPosition (при использовании position)
      // API v2 может возвращать hasMore: false, но при этом есть еще товары через position
      // Это особенно важно для иерархических структур с папками - нужно пройти по всем папкам
      if (usePositionPagination) {
        // При использовании position продолжаем, пока есть newLastPosition
        if (!newLastPosition && !pricesResponse.hasMore) {
          console.log(`[SBIS Import] Нет больше товаров при использовании position (hasMore: ${pricesResponse.hasMore}, newLastPosition: ${newLastPosition})`)
          console.log(`[SBIS Import] ВАЖНО: API не возвращает товары из вложенных папок через position.`)
          console.log(`[SBIS Import] Всего загружено товаров: ${allProducts.length}`)
          break
        }
        lastPosition = newLastPosition // Обновляем position для следующей итерации
        if (newLastPosition) {
          console.log(`[SBIS Import] Продолжаем загрузку с position: ${newLastPosition} (всего загружено товаров: ${allProducts.length})`)
        }
      } else {
        // При использовании page продолжаем, пока получаем товары
        // ВАЖНО: Игнорируем hasMore, так как API может неправильно его возвращать
        if (pricesResponse.items.length === 0) {
          console.log(`[SBIS Import] Получено 0 товаров на странице ${currentPage}, прекращаем загрузку`)
          break
        }
        // Если получили товары, продолжаем на следующей странице
        currentPage++
        console.log(`[SBIS Import] Продолжаем загрузку через page: ${currentPage} (всего загружено товаров: ${allProducts.length})`)
      }
      
      // Задержка между запросами, чтобы не перегружать API
      // Увеличена до 2 секунд для избежания ошибок таймаута
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    console.log(`[SBIS Import] Всего загружено товаров: ${allProducts.length}`)
    
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
