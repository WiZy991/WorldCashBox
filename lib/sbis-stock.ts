/**
 * Интеграция с СБИС API для получения остатков товаров на складе
 * 
 * Документация: https://sbis.ru/help/integration/api
 */

import { getSBISAccessToken, formatSBISDate } from './sbis-prices'

export interface SBISStockItem {
  id: string | number // ID товара в СБИС
  name?: string // Название товара
  stock: number // Количество на складе
  warehouseId?: string // ID склада
  warehouseName?: string // Название склада
}

export interface SBISStockResponse {
  items: SBISStockItem[]
  hasMore: boolean
}

/**
 * Получение остатков товаров на складе через СБИС API
 * 
 * @param warehouseId - ID склада в СБИС (UUID)
 * @param pointId - Идентификатор точки продаж
 * @param actualDate - Дата и время для запроса остатков (формат: "ДД.ММ.ГГГГ ЧЧ:ММ:СС")
 * @param searchString - Поиск по названию товара (опционально)
 * @param page - Номер страницы (опционально)
 * @param pageSize - Количество записей на странице (опционально)
 */
export async function getSBISStock(
  warehouseId: string,
  pointId: number,
  actualDate: string,
  searchString?: string,
  page?: number,
  pageSize?: number
): Promise<SBISStockResponse> {
  const accessToken = getSBISAccessToken()

  if (!warehouseId) {
    throw new Error('warehouseId обязателен для получения остатков')
  }

  if (!pointId) {
    throw new Error('pointId обязателен для получения остатков')
  }

  if (!actualDate) {
    throw new Error('actualDate обязателен для получения остатков')
  }

  // Формируем параметры запроса
  const params = new URLSearchParams({
    warehouseId: warehouseId,
    pointId: pointId.toString(),
    actualDate: actualDate,
  })

  if (searchString) {
    params.append('searchString', searchString)
  }
  if (page !== undefined) {
    params.append('page', page.toString())
  }
  if (pageSize !== undefined) {
    params.append('pageSize', pageSize.toString())
  }

  // URL для получения остатков товаров на складе
  // Примечание: URL может отличаться в зависимости от версии API СБИС
  // Возможные варианты:
  // - https://api.sbis.ru/retail/nomenclature/stock?
  // - https://api.sbis.ru/retail/warehouse/stock?
  // - https://online.sbis.ru/service/ (JSON-RPC метод)
  const url = `https://api.sbis.ru/retail/nomenclature/stock?${params.toString()}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-SBISAccessToken': accessToken,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`СБИС API вернул ошибку (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    
    // Структура ответа может отличаться в зависимости от API
    // Адаптируйте под реальную структуру ответа СБИС
    return {
      items: data.items || data.stock || data.result || [],
      hasMore: data.outcome?.hasMore || data.hasMore || false,
    }
  } catch (error) {
    console.error('Ошибка получения остатков из СБИС:', error)
    throw error
  }
}

/**
 * Получение остатков товара по его ID через JSON-RPC API СБИС
 * 
 * @param productId - ID товара в СБИС
 * @param warehouseId - ID склада в СБИС (UUID)
 * @param sessionId - ID сессии СБИС (получается через авторизацию)
 */
export async function getSBISProductStockRPC(
  productId: string | number,
  warehouseId: string,
  sessionId: string
): Promise<number> {
  try {
    const requestBody = {
      jsonrpc: '2.0',
      protocol: 5,
      method: 'sabyWarehouse.GetStock',
      params: {
        Номенклатура: {
          Ид: String(productId),
        },
        Склад: {
          Ид: warehouseId,
        },
      },
      id: 1,
    }

    const response = await fetch('https://online.sbis.ru/service/', {
      method: 'POST',
      headers: {
        'Host': 'online.sbis.ru',
        'Content-Type': 'application/json-rpc; charset=utf-8',
        'Accept': 'application/json-rpc',
        'X-SBISSessionID': sessionId,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`СБИС API вернул ошибку (${response.status}): ${errorText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(`Ошибка СБИС API: ${data.error.message || JSON.stringify(data.error)}`)
    }

    // Структура ответа может отличаться
    return data.result?.Остаток || data.result?.Количество || data.result || 0
  } catch (error) {
    console.error(`Ошибка получения остатков товара ${productId} из СБИС:`, error)
    throw error
  }
}

/**
 * Получение остатков товара по его ID через REST API СБИС
 * 
 * @param productId - ID товара в СБИС
 * @param warehouseId - ID склада в СБИС (UUID)
 * @param pointId - Идентификатор точки продаж
 */
export async function getSBISProductStock(
  productId: string | number,
  warehouseId: string,
  pointId: number
): Promise<number | null> {
  try {
    const { formatSBISDate } = await import('./sbis-prices')
    const actualDate = formatSBISDate()
    const stock = await getSBISStock(warehouseId, pointId, actualDate)
    
    // Ищем товар по ID
    const product = stock.items.find(item => 
      String(item.id) === String(productId)
    )
    
    return product?.stock ?? null
  } catch (error) {
    console.error(`Ошибка получения остатков товара ${productId} из СБИС:`, error)
    return null
  }
}

/**
 * Получение списка складов через JSON-RPC API СБИС
 * 
 * @param sessionId - ID сессии СБИС (получается через авторизацию)
 */
export async function getSBISWarehouses(sessionId: string): Promise<Array<{ id: string; name: string; code?: string }>> {
  try {
    const requestBody = {
      jsonrpc: '2.0',
      protocol: 5,
      method: 'sabyWarehouse.List',
      params: {},
      id: 1,
    }

    const response = await fetch('https://online.sbis.ru/service/', {
      method: 'POST',
      headers: {
        'Host': 'online.sbis.ru',
        'Content-Type': 'application/json-rpc; charset=utf-8',
        'Accept': 'application/json-rpc',
        'X-SBISSessionID': sessionId,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`СБИС API вернул ошибку (${response.status}): ${errorText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(`Ошибка СБИС API: ${data.error.message || JSON.stringify(data.error)}`)
    }

    // Структура ответа может отличаться
    const warehouses = data.result || []
    return warehouses.map((w: any) => ({
      id: w.Ид || w.id || w.Идентификатор,
      name: w.Наименование || w.name || w.Название,
      code: w.Код || w.code,
    }))
  } catch (error) {
    console.error('Ошибка получения списка складов из СБИС:', error)
    throw error
  }
}
