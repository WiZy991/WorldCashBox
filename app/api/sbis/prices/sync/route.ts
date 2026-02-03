import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { Product } from '@/data/products'
import { 
  getSBISPriceLists, 
  getSBISPrices, 
  formatSBISDate,
  getSBISProductPrice 
} from '@/lib/sbis-prices'
import {
  getSBISStock,
  getSBISProductStock,
  getSBISWarehouseById
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

    // Получаем актуальные цены из СБИС
    const actualDate = formatSBISDate()
    let allPrices: Array<{ id: string | number; name: string; price: number }> = []
    let hasMore = true
    let page = 1
    const pageSize = 100

    try {
      while (hasMore) {
        const pricesResponse = await getSBISPrices(priceListId, SBIS_POINT_ID, actualDate, undefined, page, pageSize)
        allPrices = allPrices.concat(pricesResponse.items)
        hasMore = pricesResponse.hasMore
        page++
        
        // Защита от бесконечного цикла
        if (page > 100) {
          console.warn('Достигнут лимит страниц (100), прерываем загрузку')
          break
        }
      }
      console.log(`Загружено ${allPrices.length} товаров из прайс-листа СБИС`)
      // Логируем структуру первых товаров для отладки
      if (allPrices.length > 0) {
        console.log('Пример структуры товара из СБИС (первые 3):', 
          allPrices.slice(0, 3).map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            // Показываем все доступные поля
            allFields: Object.keys(p)
          }))
        )
      }
    } catch (error) {
      console.error('Ошибка получения цен из СБИС:', error)
      // Если не удалось получить цены через API цен, пробуем получить по каждому товару
      console.log('Пробуем получить цены по каждому товару индивидуально...')
    }

    // Получаем остатки товаров из СБИС (если включена синхронизация остатков и найден склад)
    let allStock: Array<{ id: string | number; stock: number }> = []
    if (syncStock && warehouseId) {
      try {
        const actualDate = formatSBISDate()
        let hasMoreStock = true
        let pageStock = 1
        const pageSizeStock = 100

        while (hasMoreStock) {
          const stockResponse = await getSBISStock(
            warehouseId,
            SBIS_POINT_ID,
            actualDate,
            undefined,
            pageStock,
            pageSizeStock
          )
          allStock = allStock.concat(stockResponse.items)
          hasMoreStock = stockResponse.hasMore
          pageStock++
          
          // Защита от бесконечного цикла
          if (pageStock > 100) {
            console.warn('Достигнут лимит страниц для остатков (100), прерываем загрузку')
            break
          }
        }
        console.log(`Загружено остатков товаров: ${allStock.length}`)
      } catch (error) {
        console.error('Ошибка получения остатков из СБИС:', error)
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
        // Ищем цену в загруженных данных
        // Пробуем разные варианты сопоставления:
        // 1. Точное совпадение ID
        // 2. Совпадение кода товара (если есть поле code)
        // 3. Частичное совпадение по названию
        const priceItem = allPrices.find(item => {
          // Точное совпадение ID
          if (String(item.id) === String(product.sbisId)) {
            console.log(`Товар ${product.name} найден по ID: ${item.id}`)
            return true
          }
          // Совпадение кода (если есть поле code в ответе API)
          if ((item as any).code && String((item as any).code) === String(product.sbisId)) {
            console.log(`Товар ${product.name} найден по коду: ${(item as any).code}`)
            return true
          }
          // Совпадение артикула (если есть поле article или sku)
          if ((item as any).article && String((item as any).article) === String(product.sbisId)) {
            console.log(`Товар ${product.name} найден по артикулу: ${(item as any).article}`)
            return true
          }
          // Частичное совпадение по названию (как запасной вариант)
          if (item.name && product.name) {
            const itemNameLower = item.name.toLowerCase()
            const productNameLower = product.name.toLowerCase()
            if (itemNameLower.includes(productNameLower) || productNameLower.includes(itemNameLower)) {
              console.log(`Товар ${product.name} найден по названию: ${item.name}`)
              return true
            }
          }
          return false
        })
        
        if (priceItem) {
          newPrice = priceItem.price
          console.log(`Цена для товара ${product.name} (sbisId: ${product.sbisId}): ${newPrice}`)
        } else {
          console.warn(`Товар ${product.name} (sbisId: ${product.sbisId}) не найден в прайс-листе. Доступно товаров: ${allPrices.length}`)
          // Логируем первые несколько товаров для отладки
          if (allPrices.length > 0 && allPrices.length <= 10) {
            console.log('Примеры товаров из прайс-листа:', allPrices.map(p => ({ id: p.id, name: p.name, code: (p as any).code })))
          }
        }
      }

      // Если не нашли в общем списке, пробуем получить индивидуально
      if (newPrice === null && product.sbisId && priceListId) {
        try {
          newPrice = await getSBISProductPrice(product.sbisId, priceListId, SBIS_POINT_ID)
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
        if (newStock === null) {
          try {
            newStock = await getSBISProductStock(product.sbisId, warehouseId, SBIS_POINT_ID)
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
