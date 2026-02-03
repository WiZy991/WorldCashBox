import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { Product } from '@/data/products'
import { 
  getSBISPriceLists, 
  getSBISPrices, 
  formatSBISDate,
  getSBISProductPrice,
  searchSBISProductByCode 
} from '@/lib/sbis-prices'
import {
  getSBISStock,
  getSBISProductStock,
  getSBISWarehouseById,
  getSBISCompanies,
  getSBISCompanyWarehouses
} from '@/lib/sbis-stock'

// Помечаем route как динамический, так как он использует process.env и файловую систему
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const productsJsonPath = join(process.cwd(), 'data', 'products.json')

/**
 * API endpoint для синхронизации цен товаров из СБИС
 * 
 * Использование:
 * POST /api/sbis/prices/sync
 * 
 * Body (опционально):
 * {
 *   "priceListId": 15,  // ID прайс-листа (если не указан, используется из env)
 *   "pointId": 206,     // ID точки продаж (если не указан, используется из env)
 *   "force": false      // Принудительное обновление всех товаров
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Проверка авторизации (опционально, можно добавить проверку токена)
    // const authHeader = request.headers.get('authorization')
    // if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json().catch(() => ({}))
    
    const SBIS_POINT_ID = parseInt(process.env.SBIS_POINT_ID || body.pointId || '0')
    const SBIS_PRICE_LIST_ID = parseInt(process.env.SBIS_PRICE_LIST_ID || body.priceListId || '0')
    const SBIS_WAREHOUSE_ID = process.env.SBIS_WAREHOUSE_ID || body.warehouseId
    const SBIS_WAREHOUSE_NAME = process.env.SBIS_WAREHOUSE_NAME || body.warehouseName // Предпочтительное название склада
    const force = body.force || false
    let syncStock = body.syncStock !== false // По умолчанию синхронизируем остатки

    if (!SBIS_POINT_ID || SBIS_POINT_ID === 0) {
      // Логируем для отладки
      console.error('SBIS_POINT_ID не настроен. Проверьте переменные окружения:')
      console.error('- process.env.SBIS_POINT_ID:', process.env.SBIS_POINT_ID)
      console.error('- body.pointId:', body.pointId)
      
      return NextResponse.json(
        { 
          error: 'SBIS_POINT_ID не настроен',
          details: 'Укажите pointId в запросе или создайте файл .env.local с переменной SBIS_POINT_ID=206',
          hint: 'Переменные окружения должны быть в файле .env.local (для разработки) или .env.production (для продакшена). После изменения переменных окружения необходимо перезапустить сервер.'
        },
        { status: 400 }
      )
    }

    // Автоматически получаем склад по названию через sabyWarehouse.Read
    let warehouseId: string | undefined = undefined
    let warehouseInfo: { id: string; name: string } | null = null

    if (syncStock) {
      // Приоритет: сначала ищем по названию (если указано), затем по ID
      if (SBIS_WAREHOUSE_NAME) {
        try {
          console.log(`Автоматический поиск склада по названию: ${SBIS_WAREHOUSE_NAME}`)
          const { getSBISWarehouseByName } = await import('@/lib/sbis-stock')
          const warehouse = await getSBISWarehouseByName(SBIS_WAREHOUSE_NAME)
          warehouseId = warehouse.id
          warehouseInfo = { id: warehouse.id, name: warehouse.name }
          console.log(`✓ Склад автоматически найден по названию: ${warehouse.name} (${warehouse.id})`)
        } catch (error) {
          console.error(`Ошибка поиска склада по названию "${SBIS_WAREHOUSE_NAME}":`, error)
          // Если поиск по названию не удался, пробуем использовать ID (если указан)
          if (SBIS_WAREHOUSE_ID) {
            console.log(`Используем указанный SBIS_WAREHOUSE_ID: ${SBIS_WAREHOUSE_ID}`)
            warehouseId = SBIS_WAREHOUSE_ID
            // Пробуем проверить склад по ID
            try {
              const warehouse = await getSBISWarehouseById(SBIS_WAREHOUSE_ID)
              warehouseInfo = { id: warehouse.id, name: warehouse.name }
              console.log(`✓ Склад найден по ID: ${warehouse.name} (${warehouse.id})`)
            } catch (idError) {
              console.warn(`Не удалось проверить склад с ID ${SBIS_WAREHOUSE_ID}:`, idError)
              console.warn('Продолжаем работу с указанным ID склада.')
            }
          } else {
            console.warn('Синхронизация остатков будет пропущена - склад не найден.')
            syncStock = false
          }
        }
      } else if (SBIS_WAREHOUSE_ID) {
        // Если название не указано, используем ID
        warehouseId = SBIS_WAREHOUSE_ID
        try {
          const warehouse = await getSBISWarehouseById(SBIS_WAREHOUSE_ID)
          warehouseInfo = { id: warehouse.id, name: warehouse.name }
          console.log(`✓ Склад найден по ID: ${warehouse.name} (${warehouse.id})`)
        } catch (error) {
          console.warn(`Не удалось проверить склад с ID ${SBIS_WAREHOUSE_ID}:`, error)
          console.warn('Продолжаем работу с указанным ID склада.')
        }
      } else {
        // Если не указано ни название, ни ID, отключаем синхронизацию остатков
        console.warn('SBIS_WAREHOUSE_ID и SBIS_WAREHOUSE_NAME не указаны. Синхронизация остатков будет пропущена.')
        console.warn('Подсказка: Укажите SBIS_WAREHOUSE_NAME в ecosystem.config.js для автоматического поиска склада.')
        syncStock = false
      }
    }

    // Загружаем товары
    let products: Product[] = []
    try {
      const content = await readFile(productsJsonPath, 'utf-8')
      products = JSON.parse(content)
      if (!Array.isArray(products)) {
        products = []
      }
    } catch (error) {
      console.error('Ошибка чтения товаров:', error)
      return NextResponse.json(
        { error: 'Не удалось загрузить товары' },
        { status: 500 }
      )
    }

    // Если не указан priceListId, получаем список прайс-листов
    let priceListId = SBIS_PRICE_LIST_ID
    if (!priceListId) {
      try {
        const actualDate = formatSBISDate()
        const priceListsResponse = await getSBISPriceLists(SBIS_POINT_ID, actualDate)
        
        if (priceListsResponse.priceLists.length === 0) {
          return NextResponse.json(
            { error: 'Не найдено прайс-листов для указанной точки продаж' },
            { status: 404 }
          )
        }
        
        // Используем первый прайс-лист
        priceListId = priceListsResponse.priceLists[0].id
        console.log(`Используется прайс-лист: ${priceListId} (${priceListsResponse.priceLists[0].name})`)
      } catch (error) {
        console.error('Ошибка получения прайс-листов:', error)
        return NextResponse.json(
          { error: `Не удалось получить прайс-листы: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}` },
          { status: 500 }
        )
      }
    }

    // Получаем актуальные цены из СБИС через метод "Получить список товаров для Saby Retail" (пункт 8, API v2)
    let allPrices: Array<{ id: string | number; name: string; price: number; code?: string; article?: string }> = []
    let hasMore = true
    let position: number | undefined = undefined // Используем position для пагинации в v2 API
    const pageSize = 1000 // Максимальный размер страницы в v2 API

    try {
      while (hasMore) {
        // Метод getSBISPrices теперь использует /retail/v2/nomenclature/list (пункт 8, API v2)
        // actualDate не требуется для этого метода, но оставляем для совместимости
        const actualDate = formatSBISDate()
        const pricesResponse = await getSBISPrices(priceListId, SBIS_POINT_ID, actualDate, undefined, undefined, pageSize)
        allPrices = allPrices.concat(pricesResponse.items)
        hasMore = pricesResponse.hasMore
        
        // В v2 API пагинация через position, но для простоты используем pageSize=1000
        // Если нужно получить больше товаров, можно добавить поддержку position/order
        if (!hasMore || allPrices.length >= 10000) {
          // Защита от слишком большого количества товаров
          console.log(`Загружено ${allPrices.length} товаров, останавливаем загрузку`)
          break
        }
      }
      console.log(`✓ Загружено ${allPrices.length} товаров из прайс-листа СБИС (API v2)`)
      // Логируем структуру первых товаров для отладки
      if (allPrices.length > 0) {
        console.log('Пример структуры товара из СБИС (первые 3):', 
          allPrices.slice(0, 3).map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            code: p.code,
            article: p.article,
          }))
        )
      }
    } catch (error) {
      console.error('Ошибка получения цен из СБИС:', error)
      
      // Проверяем, является ли ошибка "метод не зарегистрирован"
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('не зарегистрирован') || errorMessage.includes('prices')) {
        console.error('⚠️ КРИТИЧЕСКАЯ ОШИБКА: Метод получения цен товаров не существует в СБИС API!')
        console.error('⚠️ В документации есть только метод получения списка прайс-листов, но нет метода получения цен товаров.')
        console.error('⚠️ Необходимо обратиться к документации СБИС или техподдержке для получения правильного метода.')
        console.error('⚠️ Возможные варианты:')
        console.error('   1. Использовать JSON-RPC метод (например, sabyNomenclature.GetPrices)')
        console.error('   2. Использовать другой endpoint REST API')
        console.error('   3. Получать цены через другой способ (экспорт, вебхук и т.д.)')
      }
      
      // Если не удалось получить цены через API цен, пробуем получить по каждому товару
      console.log('Пробуем получить цены по каждому товару индивидуально...')
    }

    // Получаем остатки товаров из СБИС (если включена синхронизация остатков и найден склад)
    let allStock: Array<{ id: string | number; stock: number }> = []
    let warehouse: { id: number; name: string; uuid?: string } | null = null
    let companyId: number | null = null
    
    if (syncStock && warehouseId) {
      try {
        // Согласно документации, нужно получить числовые ID компании и склада
        // 1. Получаем список компаний
        console.log('[SBIS] Получение списка компаний...')
        const companies = await getSBISCompanies()
        if (companies.length === 0) {
          throw new Error('Не найдено компаний в СБИС')
        }
        
        // Используем первую компанию (или можно добавить переменную окружения SBIS_COMPANY_ID)
        if (!companies[0] || companies[0].id === undefined || companies[0].id === null) {
          console.error('[SBIS] ОШИБКА: Не удалось получить ID компании из ответа API')
          console.error('[SBIS] Структура ответа:', JSON.stringify(companies, null, 2))
          throw new Error('Не удалось получить ID компании из СБИС API. Проверьте структуру ответа.')
        }
        
        companyId = companies[0].id
        console.log(`[SBIS] Используется компания: ${companies[0].name} (ID: ${companyId})`)
        
        // 2. Получаем список складов компании
        console.log(`[SBIS] Получение списка складов компании ${companyId}...`)
        const warehouses = await getSBISCompanyWarehouses(companyId)
        
        // Ищем склад по UUID или по названию
        let foundWarehouse = warehouses.find(w => w.uuid === warehouseId || String(w.id) === warehouseId)
        
        // Если не нашли по UUID, пробуем найти по названию из SBIS_WAREHOUSE_NAME
        if (!foundWarehouse && SBIS_WAREHOUSE_NAME) {
          console.log(`[SBIS] Поиск склада по названию: "${SBIS_WAREHOUSE_NAME}"`)
          // Ищем склад, название или адрес которого содержит "Толстого" или "32"
          foundWarehouse = warehouses.find(w => {
            const nameLower = (w.name || '').toLowerCase()
            const addressLower = ((w as any).address || '').toLowerCase()
            const searchLower = SBIS_WAREHOUSE_NAME.toLowerCase()
            
            return nameLower.includes(searchLower) || 
                   searchLower.includes(nameLower) ||
                   addressLower.includes('толстого') ||
                   addressLower.includes('32')
          })
          if (foundWarehouse) {
            console.log(`[SBIS] Склад найден по названию/адресу: ${foundWarehouse.name} (ID: ${foundWarehouse.id}, адрес: ${(foundWarehouse as any).address || 'не указан'})`)
          }
        }
        
        // Если все еще не нашли, пробуем найти склад "WorldCashbox" (похоже на нужный)
        if (!foundWarehouse) {
          foundWarehouse = warehouses.find(w => 
            w.name && (w.name.toLowerCase().includes('worldcashbox') || w.name.toLowerCase().includes('world cashbox'))
          )
          if (foundWarehouse) {
            console.log(`[SBIS] Найден склад WorldCashbox: ${foundWarehouse.name} (ID: ${foundWarehouse.id})`)
          }
        }
        
        if (!foundWarehouse) {
          console.warn(`[SBIS] Склад с UUID ${warehouseId} или названием "${SBIS_WAREHOUSE_NAME}" не найден в списке складов компании.`)
          console.warn(`[SBIS] Доступные склады:`, warehouses.map(w => `${w.name} (ID: ${w.id}, адрес: ${(w as any).address || 'не указан'})`).join(', '))
          if (warehouses.length === 0) {
            throw new Error(`Не найдено складов для компании ${companyId}`)
          }
          // Используем первый склад
          warehouse = warehouses[0]
          console.log(`[SBIS] Используется первый склад: ${warehouse.name} (ID: ${warehouse.id})`)
          
          // 3. Получаем остатки по прайс-листу
          if (priceListId) {
            console.log(`[SBIS] Получение остатков по прайс-листу ${priceListId}...`)
            const stockResponse = await getSBISStock(
              [priceListId], // priceListIds
              undefined, // nomenclatures
              [warehouse.id], // warehouses (числовые ID)
              [companyId] // companies
            )
            allStock = stockResponse.items
            console.log(`[SBIS] Загружено остатков товаров: ${allStock.length}`)
          } else {
            console.warn('[SBIS] priceListId не указан, остатки не будут загружены')
          }
        } else {
          warehouse = foundWarehouse
          console.log(`[SBIS] Найден склад: ${warehouse.name} (ID: ${warehouse.id}, UUID: ${warehouse.uuid})`)
          
          // 3. Получаем остатки по прайс-листу
          if (priceListId) {
            console.log(`[SBIS] Получение остатков по прайс-листу ${priceListId}...`)
            const stockResponse = await getSBISStock(
              [priceListId], // priceListIds
              undefined, // nomenclatures
              [warehouse.id], // warehouses (числовые ID)
              [companyId] // companies
            )
            allStock = stockResponse.items
            console.log(`[SBIS] Загружено остатков товаров: ${allStock.length}`)
          } else {
            console.warn('[SBIS] priceListId не указан, остатки не будут загружены')
          }
        }
      } catch (error) {
        console.error('Ошибка получения остатков из СБИС:', error)
        
        // Проверяем, является ли ошибка "метод не зарегистрирован"
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('не зарегистрирован') || errorMessage.includes('stock')) {
          console.error('⚠️ КРИТИЧЕСКАЯ ОШИБКА: Метод получения остатков не существует в СБИС API!')
          console.error('⚠️ Необходимо использовать JSON-RPC метод sabyWarehouse.GetStock или другой способ.')
        }
        
        // Продолжаем работу даже если не удалось получить остатки
      }
    }

    // Обновляем цены и остатки товаров
    let updatedCount = 0
    let updatedStockCount = 0
    let notFoundCount = 0
    const now = new Date().toISOString()

    for (const product of products) {
      // Пропускаем товары без sbisId, если не принудительное обновление
      if (!product.sbisId && !force) {
        continue
      }

      let newPrice: number | null = null
      let newStock: number | null = null

      if (product.sbisId && allPrices.length > 0) {
        // Нормализуем sbisId для поиска (убираем пробелы, приводим к строке)
        const normalizedSbisId = String(product.sbisId).trim().toUpperCase()
        
        // Ищем цену в загруженных данных
        // Пробуем разные варианты сопоставления (в порядке приоритета):
        const priceItem = allPrices.find(item => {
          // Приоритет 1: Точное совпадение кода товара (nomNumber) - с нормализацией
          if (item.code) {
            const normalizedCode = String(item.code).trim().toUpperCase()
            if (normalizedCode === normalizedSbisId) {
              console.log(`✓ Товар ${product.name} найден по коду (nomNumber): ${item.code} === ${product.sbisId}`)
              return true
            }
            // Частичное совпадение (если код содержит sbisId или наоборот)
            if (normalizedCode.includes(normalizedSbisId) || normalizedSbisId.includes(normalizedCode)) {
              console.log(`⚠ Товар ${product.name} найден по частичному совпадению кода: ${item.code} ~ ${product.sbisId}`)
              return true
            }
          }
          // Приоритет 2: Точное совпадение артикула (article) - с нормализацией
          if (item.article) {
            const normalizedArticle = String(item.article).trim().toUpperCase()
            if (normalizedArticle === normalizedSbisId) {
              console.log(`✓ Товар ${product.name} найден по артикулу: ${item.article} === ${product.sbisId}`)
              return true
            }
            // Частичное совпадение
            if (normalizedArticle.includes(normalizedSbisId) || normalizedSbisId.includes(normalizedArticle)) {
              console.log(`⚠ Товар ${product.name} найден по частичному совпадению артикула: ${item.article} ~ ${product.sbisId}`)
              return true
            }
          }
          // Приоритет 3: Точное совпадение ID
          if (String(item.id) === normalizedSbisId) {
            console.log(`✓ Товар ${product.name} найден по ID: ${item.id}`)
            return true
          }
          // Приоритет 4: Частичное совпадение по названию (как запасной вариант)
          if (item.name && product.name) {
            const itemNameLower = item.name.toLowerCase().trim()
            const productNameLower = product.name.toLowerCase().trim()
            // Проверяем, содержит ли одно название другое (с допуском на небольшие различия)
            if (itemNameLower === productNameLower || 
                itemNameLower.includes(productNameLower) || 
                productNameLower.includes(itemNameLower)) {
              console.log(`⚠ Товар ${product.name} найден по названию (неточное совпадение): ${item.name}`)
              return true
            }
          }
          return false
        })
        
        if (priceItem) {
          newPrice = priceItem.price
          console.log(`Цена для товара ${product.name} (sbisId: ${product.sbisId}): ${newPrice}`)
        } else {
          // Показываем примеры кодов из СБИС для отладки
          const sampleCodes = allPrices
            .filter(p => p.code || p.article)
            .slice(0, 10)
            .map(p => ({ code: p.code, article: p.article, name: p.name, id: p.id }))
          console.warn(`Товар ${product.name} (sbisId: ${product.sbisId}) не найден в прайс-листе. Доступно товаров: ${allPrices.length}`)
          console.warn(`Примеры кодов из СБИС:`, JSON.stringify(sampleCodes, null, 2))
        }
      }

      // Если не нашли в общем списке, пробуем поиск по коду через searchString
      if (newPrice === null && product.sbisId && priceListId) {
        try {
          console.log(`[SBIS] Пробуем найти товар по коду "${product.sbisId}" через searchString...`)
          const foundProduct = await searchSBISProductByCode(
            String(product.sbisId),
            priceListId,
            SBIS_POINT_ID || undefined
          )
          
          if (foundProduct) {
            newPrice = foundProduct.price
            console.log(`✓ Товар ${product.name} найден по коду через searchString: цена = ${newPrice}`)
            
            // Если в найденном товаре есть остаток, используем его
            if (foundProduct.balance !== undefined && foundProduct.balance !== null) {
              newStock = foundProduct.balance
              console.log(`✓ Остаток для товара ${product.name} из searchString: ${newStock}`)
            }
          } else {
            console.warn(`Товар с кодом "${product.sbisId}" не найден через searchString`)
          }
        } catch (error) {
          console.error(`Ошибка поиска товара по коду ${product.sbisId}:`, error)
        }
      }
      
      // Если все еще не нашли и sbisId - числовой ID, пробуем получить индивидуально
      if (newPrice === null && product.sbisId && priceListId && !isNaN(Number(product.sbisId))) {
        try {
          newPrice = await getSBISProductPrice(Number(product.sbisId), priceListId, SBIS_POINT_ID)
        } catch (error) {
          console.error(`Ошибка получения цены для товара ${product.id} (sbisId: ${product.sbisId}):`, error)
        }
      }

      // Получаем остатки товара
      if (syncStock && warehouseId && product.sbisId) {
        if (allStock.length > 0) {
          // Ищем остатки в загруженных данных
          const stockItem = allStock.find(item => 
            String(item.id) === String(product.sbisId)
          )
          
          if (stockItem) {
            newStock = stockItem.stock
          }
        }

        // Если не нашли в общем списке, пробуем получить индивидуально
        // Для этого нужны числовые ID склада и компании, которые уже получены выше
        if (newStock === null && warehouse && companyId !== null) {
          try {
            // Преобразуем sbisId в число (если это числовой ID, а не код)
            const productIdNum = typeof product.sbisId === 'string' 
              ? parseInt(product.sbisId, 10) 
              : product.sbisId
            
            if (!isNaN(Number(productIdNum))) {
              newStock = await getSBISProductStock(productIdNum, warehouse.id, companyId)
            } else {
              console.log(`[SBIS] sbisId "${product.sbisId}" не является числовым ID, пропускаем индивидуальный запрос остатков`)
            }
          } catch (error) {
            console.error(`Ошибка получения остатков для товара ${product.id} (sbisId: ${product.sbisId}):`, error)
          }
        }
      }

      // Обновляем цену (обновляем всегда, если найдена новая цена)
      if (newPrice !== null) {
        const oldPrice = product.price
        product.price = newPrice
        product.priceUpdatedAt = now
        product.sbisPriceListId = priceListId
        if (oldPrice !== newPrice) {
          console.log(`✓ Цена обновлена для товара ${product.name}: ${oldPrice || 'не было'} -> ${newPrice}`)
          updatedCount++
        } else {
          console.log(`Цена для товара ${product.name} не изменилась: ${newPrice}`)
        }
      } else if (newPrice === null && product.sbisId) {
        console.warn(`✗ Цена не найдена для товара ${product.name} (sbisId: ${product.sbisId})`)
        notFoundCount++
      }

      // Обновляем остатки
      if (newStock !== null) {
        const oldStock = product.stock
        product.stock = newStock
        product.inStock = newStock > 0
        product.stockUpdatedAt = now
        product.sbisWarehouseId = warehouseId
        
        if (oldStock !== newStock) {
          updatedStockCount++
        }
      }
    }

    // Сохраняем обновленные товары
    try {
      await writeFile(productsJsonPath, JSON.stringify(products, null, 2), 'utf-8')
    } catch (error) {
      console.error('Ошибка сохранения товаров:', error)
      return NextResponse.json(
        { error: 'Не удалось сохранить обновленные товары' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Цены и остатки успешно синхронизированы',
      stats: {
        total: products.length,
        withSBISId: products.filter(p => p.sbisId).length,
        pricesUpdated: updatedCount,
        stockUpdated: updatedStockCount,
        notFound: notFoundCount,
        priceListId: priceListId,
        warehouseId: warehouseId || null,
        warehouseName: warehouseInfo?.name || null,
        totalPricesInSBIS: allPrices.length,
        syncedAt: now,
      },
    })
  } catch (error) {
    console.error('Ошибка синхронизации цен:', error)
    return NextResponse.json(
      { 
        error: 'Произошла ошибка при синхронизации цен',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint для получения статуса синхронизации
 */
export async function GET() {
  try {
    const content = await readFile(productsJsonPath, 'utf-8')
    const products: Product[] = JSON.parse(content)
    
    const withPrices = products.filter(p => p.price !== undefined && p.price !== null)
    const withSBISId = products.filter(p => p.sbisId !== undefined)
    const withStock = products.filter(p => p.stock !== undefined && p.stock !== null)
    const inStock = products.filter(p => p.inStock === true)
    const recentlyUpdated = products.filter(p => {
      if (!p.priceUpdatedAt && !p.stockUpdatedAt) return false
      const updatedAt = new Date(p.priceUpdatedAt || p.stockUpdatedAt || 0)
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return updatedAt > dayAgo
    })

    return NextResponse.json({
      total: products.length,
      withPrices: withPrices.length,
      withStock: withStock.length,
      inStock: inStock.length,
      withSBISId: withSBISId.length,
      recentlyUpdated: recentlyUpdated.length,
      lastSync: products
        .filter(p => p.priceUpdatedAt || p.stockUpdatedAt)
        .sort((a, b) => {
          const dateA = new Date(a.priceUpdatedAt || a.stockUpdatedAt || 0).getTime()
          const dateB = new Date(b.priceUpdatedAt || b.stockUpdatedAt || 0).getTime()
          return dateB - dateA
        })[0]?.priceUpdatedAt || products
        .filter(p => p.stockUpdatedAt)
        .sort((a, b) => {
          const dateA = new Date(a.stockUpdatedAt || 0).getTime()
          const dateB = new Date(b.stockUpdatedAt || 0).getTime()
          return dateB - dateA
        })[0]?.stockUpdatedAt || null,
    })
  } catch (error) {
    console.error('Ошибка получения статуса:', error)
    return NextResponse.json(
      { error: 'Не удалось получить статус синхронизации' },
      { status: 500 }
    )
  }
}
