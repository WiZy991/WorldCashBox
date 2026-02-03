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
 * Интерфейс для данных склада из СБИС
 */
export interface SBISWarehouse {
  id: string // UUID идентификатор склада
  name: string // Название склада
  code?: string | null // Код склада
  address?: string | null // Адрес склада
  organization?: {
    inn: string // ИНН компании
    kpp?: string | null // КПП компании
    branchCode?: string | null // Код филиала
  }
}

/**
 * Параметры для поиска склада
 */
export interface SBISWarehouseRequisites {
  id?: string // UUID идентификатор склада
  name?: string // Название склада
  code?: string // Код склада
  organization?: {
    inn: string // ИНН компании
    kpp?: string // КПП компании
    branchCode?: string // Код филиала
  }
}

/**
 * Получение информации о складе через JSON-RPC API СБИС (sabyWarehouse.Read)
 * 
 * Метод возвращает запись карточки склада по идентификатору, названию или коду.
 * Для поиска склада обязательно передайте один из реквизитов.
 * 
 * @param requisites - Данные для поиска склада (id, name, code или organization)
 * @param sessionId - ID сессии СБИС (опционально, если не указан, используется сервисный ключ)
 * @returns Информация о складе
 */
export async function readSBISWarehouse(
  requisites: SBISWarehouseRequisites,
  sessionId?: string
): Promise<SBISWarehouse> {
  // Проверяем, что передан хотя бы один реквизит для поиска
  if (!requisites.id && !requisites.name && !requisites.code && !requisites.organization) {
    throw new Error('Для поиска склада необходимо указать хотя бы один реквизит: id, name, code или organization')
  }

  try {
    // Формируем параметры запроса
    const params: any = {
      requisites: {},
    }

    if (requisites.id) {
      params.requisites.id = requisites.id
    }
    if (requisites.name) {
      params.requisites.name = requisites.name
    }
    if (requisites.code) {
      params.requisites.code = requisites.code
    }
    if (requisites.organization) {
      params.requisites.organization = {}
      if (requisites.organization.inn) {
        params.requisites.organization.inn = requisites.organization.inn
      }
      if (requisites.organization.kpp) {
        params.requisites.organization.kpp = requisites.organization.kpp
      }
      if (requisites.organization.branchCode) {
        params.requisites.organization.branchCode = requisites.organization.branchCode
      }
    }

    const requestBody = {
      jsonrpc: '2.0',
      protocol: 5,
      method: 'sabyWarehouse.Read',
      params: params,
      id: 1,
    }

    // Формируем заголовки
    const headers: Record<string, string> = {
      'Host': 'online.sbis.ru',
      'Content-Type': 'application/json-rpc; charset=utf-8',
      'Accept': 'application/json-rpc',
    }

    // Если указан sessionId, используем его, иначе пробуем использовать сервисный ключ
    if (sessionId) {
      headers['X-SBISSessionID'] = sessionId
    } else {
      // Пробуем использовать сервисный ключ как токен доступа
      const accessToken = getSBISAccessToken()
      headers['X-SBISAccessToken'] = accessToken
    }

    const response = await fetch('https://online.sbis.ru/service/', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`СБИС API вернул ошибку (${response.status}): ${errorText}`)
    }

    const data = await response.json()

    if (data.error) {
      const errorMsg = data.error.message || JSON.stringify(data.error)
      throw new Error(`Ошибка СБИС API: ${errorMsg}`)
    }

    // Преобразуем ответ в стандартный формат
    const result = data.result || {}
    const warehouse: SBISWarehouse = {
      id: result.Ид || result.id || result.Идентификатор || '',
      name: result.Наименование || result.name || result.Название || '',
      code: result.Код || result.code || null,
      address: result.Адрес || result.address || null,
      organization: result.Организация || result.organization ? {
        inn: (result.Организация || result.organization).ИНН || (result.Организация || result.organization).inn || '',
        kpp: (result.Организация || result.organization).КПП || (result.Организация || result.organization).kpp || null,
        branchCode: (result.Организация || result.organization).КодФилиала || (result.Организация || result.organization).branchCode || null,
      } : undefined,
    }

    if (!warehouse.id) {
      throw new Error('Склад не найден или неверный формат ответа от СБИС')
    }

    return warehouse
  } catch (error) {
    console.error('Ошибка получения информации о складе из СБИС:', error)
    throw error
  }
}

/**
 * Получение информации о складе по ID
 * 
 * @param warehouseId - UUID идентификатор склада
 * @param sessionId - ID сессии СБИС (опционально)
 */
export async function getSBISWarehouseById(
  warehouseId: string,
  sessionId?: string
): Promise<SBISWarehouse> {
  return readSBISWarehouse({ id: warehouseId }, sessionId)
}

/**
 * Получение информации о складе по названию
 * 
 * @param warehouseName - Название склада
 * @param sessionId - ID сессии СБИС (опционально)
 */
export async function getSBISWarehouseByName(
  warehouseName: string,
  sessionId?: string
): Promise<SBISWarehouse> {
  return readSBISWarehouse({ name: warehouseName }, sessionId)
}

/**
 * Получение списка складов через JSON-RPC API СБИС
 * 
 * @param sessionId - ID сессии СБИС (получается через авторизацию, опционально)
 */
export async function getSBISWarehouses(sessionId?: string): Promise<SBISWarehouse[]> {
  try {
    const requestBody = {
      jsonrpc: '2.0',
      protocol: 5,
      method: 'sabyWarehouse.List',
      params: {},
      id: 1,
    }

    const headers: Record<string, string> = {
      'Host': 'online.sbis.ru',
      'Content-Type': 'application/json-rpc; charset=utf-8',
      'Accept': 'application/json-rpc',
    }

    // Если указан sessionId, используем его, иначе пробуем использовать сервисный ключ
    if (sessionId) {
      headers['X-SBISSessionID'] = sessionId
    } else {
      const accessToken = getSBISAccessToken()
      headers['X-SBISAccessToken'] = accessToken
    }

    const response = await fetch('https://online.sbis.ru/service/', {
      method: 'POST',
      headers: headers,
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
    return warehouses.map((w: any): SBISWarehouse => ({
      id: w.Ид || w.id || w.Идентификатор || '',
      name: w.Наименование || w.name || w.Название || '',
      code: w.Код || w.code || null,
      address: w.Адрес || w.address || null,
      organization: w.Организация || w.organization ? {
        inn: (w.Организация || w.organization).ИНН || (w.Организация || w.organization).inn || '',
        kpp: (w.Организация || w.organization).КПП || (w.Организация || w.organization).kpp || null,
        branchCode: (w.Организация || w.organization).КодФилиала || (w.Организация || w.organization).branchCode || null,
      } : undefined,
    }))
  } catch (error) {
    console.error('Ошибка получения списка складов из СБИС:', error)
    throw error
  }
}

/**
 * Получение первого доступного склада из СБИС
 * 
 * @param preferredName - Предпочтительное название склада (опционально)
 * @param sessionId - ID сессии СБИС (опционально)
 * @returns Информация о складе или null, если склады не найдены
 */
export async function getFirstSBISWarehouse(
  preferredName?: string,
  sessionId?: string
): Promise<SBISWarehouse | null> {
  try {
    const warehouses = await getSBISWarehouses(sessionId)
    
    if (warehouses.length === 0) {
      return null
    }

    // Если указано предпочтительное название, ищем по нему
    if (preferredName) {
      const preferred = warehouses.find(w => 
        w.name.toLowerCase().includes(preferredName.toLowerCase()) ||
        preferredName.toLowerCase().includes(w.name.toLowerCase())
      )
      if (preferred) {
        return preferred
      }
    }

    // Возвращаем первый склад
    return warehouses[0]
  } catch (error) {
    console.error('Ошибка получения первого склада из СБИС:', error)
    return null
  }
}
