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
 * Получение цен товаров из прайс-листа СБИС
 * 
 * @param priceListId - ID прайс-листа
 * @param pointId - Идентификатор точки продаж
 * @param actualDate - Дата и время для запроса цен
 * @param searchString - Поиск по названию товара (опционально)
 * @param page - Номер страницы (опционально)
 * @param pageSize - Количество записей на странице (опционально)
 */
export async function getSBISPrices(
  priceListId: number,
  pointId: number,
  actualDate: string,
  searchString?: string,
  page?: number,
  pageSize?: number
): Promise<{ items: SBISPriceItem[]; hasMore: boolean }> {
  const accessToken = getSBISAccessToken()

  // Формируем параметры запроса
  const params = new URLSearchParams({
    priceListId: priceListId.toString(),
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

  // ВАЖНО: В документации нет метода получения цен товаров из прайс-листа!
  // Есть только метод получения списка прайс-листов.
  // Возможно, нужно использовать другой endpoint или метод.
  const url = `https://api.sbis.ru/retail/nomenclature/prices?${params.toString()}`
  
  console.log(`[SBIS] Запрос цен товаров: ${url}`)
  console.log(`[SBIS] Параметры: priceListId=${priceListId}, pointId=${pointId}, actualDate=${actualDate}`)

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
    
    // Логируем полный ответ для отладки
    console.log('[SBIS] Полный ответ API:', JSON.stringify(data, null, 2))
    
    // Структура ответа может отличаться в зависимости от API
    // Адаптируйте под реальную структуру ответа СБИС
    const items = data.items || data.prices || data.nomenclature || data.data || []
    const hasMore = data.outcome?.hasMore || data.hasMore || false
    
    console.log(`[SBIS] Получено товаров: ${items.length}, hasMore: ${hasMore}`)
    
    if (items.length === 0) {
      console.warn('[SBIS] ВНИМАНИЕ: API вернул 0 товаров! Проверьте:')
      console.warn('[SBIS] 1. Правильность priceListId и pointId')
      console.warn('[SBIS] 2. Формат даты actualDate')
      console.warn('[SBIS] 3. Возможно, endpoint /retail/nomenclature/prices не существует')
      console.warn('[SBIS] 4. Структура ответа:', Object.keys(data))
    }
    
    return {
      items: items,
      hasMore: hasMore,
    }
  } catch (error) {
    console.error('Ошибка получения цен из СБИС:', error)
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
