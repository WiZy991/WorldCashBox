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

  // Примечание: URL может отличаться в зависимости от версии API СБИС
  // Возможно, нужно использовать другой endpoint для получения цен товаров
  const url = `https://api.sbis.ru/retail/nomenclature/prices?${params.toString()}`

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
      items: data.items || data.prices || [],
      hasMore: data.outcome?.hasMore || data.hasMore || false,
    }
  } catch (error) {
    console.error('Ошибка получения цен из СБИС:', error)
    throw error
  }
}

/**
 * Форматирование даты для СБИС API
 * Формат: "ДД.ММ.ГГГГ ЧЧ:ММ:СС"
 */
export function formatSBISDate(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`
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
