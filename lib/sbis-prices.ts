/**
 * Интеграция с СБИС API для получения актуальных цен
 * 
 * Документация: https://sbis.ru/help/integration/api
 */

export interface SBISPriceList {
  id: number
  name: string
}

export interface SBISPriceListResponse {
  priceLists: SBISPriceList[]
  outcome: {
    hasMore: boolean
  }
}

export interface SBISPriceItem {
  id: string | number
  name: string
  price: number
  currency?: string
  unit?: string
  code?: string // Код товара (nomNumber)
  article?: string // Артикул (nomNumber)
  balance?: string // Остаток товара
}

/**
 * Получение токена доступа к СБИС API
 * Использует сервисный ключ как токен доступа
 */
export function getSBISAccessToken(): string {
  // Сервисный ключ используется как токен доступа
  const SBIS_SERVICE_KEY = process.env.SBIS_SERVICE_KEY
  
  if (!SBIS_SERVICE_KEY) {
    throw new Error('SBIS_SERVICE_KEY не настроен в переменных окружения')
  }
  
  return SBIS_SERVICE_KEY
}

/**
 * Получение списка прайс-листов из СБИС
 * 
 * @param pointId - Идентификатор точки продаж
 * @param actualDate - Дата и время для запроса прайс-листа (формат: "ДД.ММ.ГГГГ ЧЧ:ММ:СС")
 * @param searchString - Поиск по названию прайса (опционально)
 * @param page - Номер страницы (опционально)
 * @param pageSize - Количество записей на странице (опционально)
 */
export async function getSBISPriceLists(
  pointId: number,
  actualDate: string,
  searchString?: string,
  page?: number,
  pageSize?: number
): Promise<SBISPriceListResponse> {
  const accessToken = getSBISAccessToken()

  if (!pointId) {
    throw new Error('pointId обязателен для получения прайс-листов')
  }

  if (!actualDate) {
    throw new Error('actualDate обязателен для получения прайс-листов')
  }

  // Формируем параметры запроса
  const params = new URLSearchParams({
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

  const url = `https://api.sbis.ru/retail/nomenclature/price-list?${params.toString()}`

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

    const data: SBISPriceListResponse = await response.json()
    return data
  } catch (error) {
    console.error('Ошибка получения прайс-листов из СБИС:', error)
    throw error
  }
}

/**
 * Получение списка товаров из прайс-листа СБИС (API v2 для Saby Retail)
 * 
 * Документация: https://api.sbis.ru/retail/v2/nomenclature/list?
 * Пункт 8: "Получить список товаров по API для Saby Retail"
 * 
 * Возвращает информацию о товарах из прайс-листа или колонки цен, включая:
 * - id (идентификатор номенклатуры)
 * - name (название товара)
 * - cost (integer) - цена товара из прайса
 * - balance (string) - остаток товара на складе
 * - article (string) - артикул наименования
 * - nomNumber (string) - код товара
 * - externalId (string) - UUID идентификатор
 * - description (string) - описание
 * - images (array[string]) - изображения
 * 
 * @param priceListId - ID прайс-листа (обязательно)
 * @param pointId - Идентификатор точки продаж (обязательно)
 * @param actualDate - Не используется в этом методе, но оставляем для совместимости
 * @param searchString - Поиск по названию товара (опционально)
 * @param page - Не используется, используется position для пагинации
 * @param pageSize - Количество записей на странице (опционально, по умолчанию 1000, максимум 1000)
 */
export async function getSBISPrices(
  priceListId: number,
  pointId: number,
  actualDate?: string, // Не используется в этом методе, но оставляем для совместимости
  searchString?: string,
  page?: number,
  pageSize?: number
): Promise<{ items: SBISPriceItem[]; hasMore: boolean }> {
  const accessToken = getSBISAccessToken()

  // Формируем параметры запроса согласно документации пункта 8
  // ВАЖНО: pointId может быть необязательным для API v2, пробуем без него если не указан
  const params = new URLSearchParams({
    priceListId: priceListId.toString(),
    withBalance: 'true', // Получаем остатки вместе с ценами
  })
  
  // pointId может быть необязательным для API v2
  if (pointId) {
    params.append('pointId', pointId.toString())
  }

  if (searchString) {
    params.append('searchString', searchString)
  }
  if (pageSize !== undefined) {
    params.append('pageSize', Math.min(pageSize, 1000).toString()) // Максимум 1000
  } else {
    params.append('pageSize', '1000') // По умолчанию 1000 записей (максимум)
  }
  // Примечание: пагинация через position и order более продвинутая,
  // но для простоты используем pageSize. Если нужно, можно добавить поддержку position/order

  const url = `https://api.sbis.ru/retail/v2/nomenclature/list?${params.toString()}`
  
  console.log(`[SBIS] Запрос списка товаров из прайс-листа (API v2): ${url}`)
  console.log(`[SBIS] Параметры: priceListId=${priceListId}, pointId=${pointId}`)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-SBISAccessToken': accessToken,
        'Content-Type': 'application/json',
      },
    })
    
    console.log(`[SBIS] Ответ API: статус ${response.status}, статус-текст: ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[SBIS] Ошибка API (${response.status}):`, errorText)
      console.error(`[SBIS] URL запроса: ${url}`)
      throw new Error(`СБИС API вернул ошибку (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    
    // Логируем структуру ответа для отладки (первые 3 товара)
    if (data.nomenclatures && data.nomenclatures.length > 0) {
      console.log('[SBIS] Пример структуры товара (API v2):', JSON.stringify(data.nomenclatures[0], null, 2))
    }
    
    // Структура ответа согласно документации пункта 8:
    // {
    //   "nomenclatures": [
    //     {
    //       "id": integer,
    //       "name": string,
    //       "cost": integer, // Цена товара из прайса
    //       "balance": string, // Остаток товара
    //       "article": string, // Артикул
    //       "nomNumber": string, // Код товара
    //       "externalId": string, // UUID
    //       ...
    //     }
    //   ],
    //   "outcome": {
    //     "hasMore": boolean
    //   }
    // }
    const nomenclatures = data.nomenclatures || []
    const hasMore = data.outcome?.hasMore || false
    
    // Преобразуем в формат SBISPriceItem
    const items: SBISPriceItem[] = nomenclatures.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: typeof item.cost === 'number' ? item.cost : parseFloat(item.cost) || 0, // cost - integer в v2
      code: item.nomNumber || item.article || undefined, // Код товара (приоритет nomNumber)
      article: item.article || item.nomNumber || undefined, // Артикул (приоритет article)
      balance: item.balance || undefined, // Остаток товара
    }))
    
    console.log(`[SBIS] Получено товаров: ${items.length}, hasMore: ${hasMore}`)
    
    if (items.length === 0) {
      console.warn('[SBIS] ВНИМАНИЕ: API вернул 0 товаров! Проверьте:')
      console.warn('[SBIS] 1. Правильность priceListId и pointId')
      console.warn('[SBIS] 2. Существует ли прайс-лист и содержит ли он товары')
      console.warn('[SBIS] 3. Структура ответа:', Object.keys(data))
    }
    
    return {
      items: items,
      hasMore: hasMore,
    }
  } catch (error) {
    console.error('Ошибка получения списка товаров из СБИС:', error)
    throw error
  }
}

/**
 * Форматирование даты для СБИС API
 * Поддерживает два формата:
 * 1. "ДД.ММ.ГГГГ ЧЧ:ММ:СС" (из документации)
 * 2. "ГГГГ-ММ-ДД ЧЧ:ММ:СС" (из примера в документации)
 * 
 * По умолчанию используем формат из примера, так как он проще
 */
export function formatSBISDate(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  // В документации указан формат "ДД.ММ.ГГГГ ЧЧ:ММ:СС", но в примере используется "ГГГГ-ММ-ДД ЧЧ:ММ:СС"
  // Используем формат из примера, так как он работает
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * Получение цены товара по его ID в СБИС
 * 
 * @param sbisId - ID товара в СБИС
 * @param priceListId - ID прайс-листа
 * @param pointId - Идентификатор точки продаж
 */
export async function getSBISProductPrice(
  sbisId: string | number,
  priceListId: number,
  pointId: number
): Promise<number | null> {
  try {
    const actualDate = formatSBISDate()
    const prices = await getSBISPrices(priceListId, pointId, actualDate)
    
    // Ищем товар по ID
    const product = prices.items.find(item => 
      String(item.id) === String(sbisId) || 
      item.name.toLowerCase().includes(String(sbisId).toLowerCase())
    )
    
    return product?.price || null
  } catch (error) {
    console.error(`Ошибка получения цены товара ${sbisId} из СБИС:`, error)
    return null
  }
}
