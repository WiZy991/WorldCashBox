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
    const force = body.force || false

    if (!SBIS_POINT_ID) {
      return NextResponse.json(
        { error: 'SBIS_POINT_ID не настроен. Укажите pointId в запросе или в переменных окружения.' },
        { status: 400 }
      )
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
    } catch (error) {
      console.error('Ошибка получения цен из СБИС:', error)
      // Если не удалось получить цены через API цен, пробуем получить по каждому товару
      console.log('Пробуем получить цены по каждому товару индивидуально...')
    }

    // Обновляем цены товаров
    let updatedCount = 0
    let notFoundCount = 0
    const now = new Date().toISOString()

    for (const product of products) {
      // Пропускаем товары без sbisId, если не принудительное обновление
      if (!product.sbisId && !force) {
        continue
      }

      let newPrice: number | null = null

      if (product.sbisId && allPrices.length > 0) {
        // Ищем цену в загруженных данных
        const priceItem = allPrices.find(item => 
          String(item.id) === String(product.sbisId) ||
          item.name.toLowerCase().includes(product.name.toLowerCase()) ||
          product.name.toLowerCase().includes(item.name.toLowerCase())
        )
        
        if (priceItem) {
          newPrice = priceItem.price
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

      if (newPrice !== null && newPrice !== product.price) {
        product.price = newPrice
        product.priceUpdatedAt = now
        product.sbisPriceListId = priceListId
        updatedCount++
      } else if (newPrice === null && product.sbisId) {
        notFoundCount++
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
      message: 'Цены успешно синхронизированы',
      stats: {
        total: products.length,
        updated: updatedCount,
        notFound: notFoundCount,
        priceListId: priceListId,
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
    const recentlyUpdated = products.filter(p => {
      if (!p.priceUpdatedAt) return false
      const updatedAt = new Date(p.priceUpdatedAt)
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return updatedAt > dayAgo
    })

    return NextResponse.json({
      total: products.length,
      withPrices: withPrices.length,
      withSBISId: withSBISId.length,
      recentlyUpdated: recentlyUpdated.length,
      lastSync: products
        .filter(p => p.priceUpdatedAt)
        .sort((a, b) => {
          const dateA = new Date(a.priceUpdatedAt || 0).getTime()
          const dateB = new Date(b.priceUpdatedAt || 0).getTime()
          return dateB - dateA
        })[0]?.priceUpdatedAt || null,
    })
  } catch (error) {
    console.error('Ошибка получения статуса:', error)
    return NextResponse.json(
      { error: 'Не удалось получить статус синхронизации' },
      { status: 500 }
    )
  }
}
