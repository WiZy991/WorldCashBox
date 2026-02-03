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
  balance?: string | number // Остаток товара (может быть string или number в зависимости от API)
  hierarchicalId?: number // Иерархический идентификатор для пагинации
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
  pageSize?: number,
  position?: number // Иерархический идентификатор для пагинации
): Promise<{ items: SBISPriceItem[]; hasMore: boolean; lastPosition?: number }> {
  const accessToken = getSBISAccessToken()

  // Формируем параметры запроса согласно документации пункта 8
  // ВАЖНО: pointId может быть необязательным для API v2
  // Если pointId вызывает ошибку "Точка продаж не найдена", пробуем без него
  const params = new URLSearchParams({
    priceListId: priceListId.toString(),
    withBalance: 'true', // Получаем остатки вместе с ценами
  })
  
  // pointId может быть необязательным для API v2
  // Пробуем без pointId, если он вызывает ошибку
  // if (pointId) {
  //   params.append('pointId', pointId.toString())
  // }

  if (searchString) {
    params.append('searchString', searchString)
  }
  if (pageSize !== undefined) {
    params.append('pageSize', Math.min(pageSize, 1000).toString()) // Максимум 1000
  } else {
    params.append('pageSize', '1000') // По умолчанию 1000 записей (максимум)
  }
  
  // Пагинация через position (иерархический идентификатор последней записи)
  // Для первой страницы position не указывается
  // Для следующих страниц используем hierarchicalId последнего элемента предыдущей страницы
  if (position !== undefined) {
    params.append('position', position.toString())
    params.append('order', 'after') // Записи после указанного position
  }

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
    // Фильтруем только товары (не папки/категории) - у товаров есть цена или они опубликованы
    const items: SBISPriceItem[] = nomenclatures
      .filter((item: any) => {
        // Пропускаем папки/категории (isParent === true)
        if (item.isParent === true) {
          return false
        }
        // Включаем товары с ценой или опубликованные товары
        return (item.cost !== null && item.cost !== undefined && item.cost > 0) || item.published === true
      })
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        price: typeof item.cost === 'number' ? item.cost : parseFloat(item.cost) || 0, // cost - integer в v2
        code: item.nomNumber ? String(item.nomNumber).trim() : undefined, // Код товара (убираем пробелы)
        article: item.article ? String(item.article).trim() : undefined, // Артикул (убираем пробелы)
        balance: item.balance !== null && item.balance !== undefined ? Number(item.balance) : undefined, // Остаток товара
        hierarchicalId: item.hierarchicalId, // Сохраняем для пагинации
      }))
    
    // Получаем hierarchicalId последнего элемента ВСЕГО массива (включая папки) для следующей страницы
    // Это важно для правильной пагинации - нужно использовать последний hierarchicalId из всего ответа
    const lastPosition = nomenclatures.length > 0
      ? (nomenclatures[nomenclatures.length - 1] as any)?.hierarchicalId
      : undefined
    
    console.log(`[SBIS] Получено товаров: ${items.length}, hasMore: ${hasMore}, lastPosition: ${lastPosition}`)
    
    if (items.length === 0) {
      console.warn('[SBIS] ВНИМАНИЕ: API вернул 0 товаров! Проверьте:')
      console.warn('[SBIS] 1. Правильность priceListId и pointId')
      console.warn('[SBIS] 2. Существует ли прайс-лист и содержит ли он товары')
      console.warn('[SBIS] 3. Структура ответа:', Object.keys(data))
    }
    
    return {
      items: items,
      hasMore: hasMore,
      lastPosition: lastPosition,
    }
  } catch (error) {
    console.error('Ошибка получения списка товаров из СБИС:', error)
    throw error
  }
}

/**
 * Поиск товара по коду/артикулу через searchString в API v2
 * 
 * @param searchCode - Код товара для поиска (например, "ST520-5000П")
 * @param priceListId - ID прайс-листа
 * @param pointId - ID точки продаж (опционально)
 */
export async function searchSBISProductByCode(
  searchCode: string,
  priceListId: number | 0, // 0 означает поиск по всему каталогу
  pointId?: number
): Promise<SBISPriceItem | null> {
  const accessToken = getSBISAccessToken()

  // Формируем параметры запроса для API v2 с searchString
  const params = new URLSearchParams({
    withBalance: 'true',
    searchString: searchCode.trim(), // Ищем по коду товара
    pageSize: '100', // Ограничиваем результаты
  })

  // priceListId может быть необязательным - если 0 или не указан, ищем по всему каталогу
  if (priceListId && priceListId > 0) {
    params.append('priceListId', priceListId.toString())
  }

  // pointId может быть необязательным и вызывает ошибку, если неверный
  // Не добавляем pointId, если он вызывает ошибку "Точка продаж не найдена"
  // if (pointId) {
  //   params.append('pointId', pointId.toString())
  // }

  const url = `https://api.sbis.ru/retail/v2/nomenclature/list?${params.toString()}`
  
  console.log(`[SBIS] Поиск товара по коду "${searchCode}": ${url}`)

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
      console.error(`[SBIS] Ошибка поиска товара (${response.status}):`, errorText)
      return null
    }

    const data = await response.json()
    const nomenclatures = data.nomenclatures || []
    
    console.log(`[SBIS] Найдено товаров по коду "${searchCode}": ${nomenclatures.length}`)
    
    if (nomenclatures.length === 0) {
      return null
    }

    // Фильтруем только товары (не папки) и ищем точное совпадение по коду
    const normalizedSearchCode = searchCode.trim().toUpperCase()
    
    for (const item of nomenclatures) {
      // Пропускаем папки
      if (item.isParent === true) {
        continue
      }

      // Проверяем точное совпадение по коду
      const itemCode = item.nomNumber ? String(item.nomNumber).trim().toUpperCase() : ''
      const itemArticle = item.article ? String(item.article).trim().toUpperCase() : ''
      
      if (itemCode === normalizedSearchCode || itemArticle === normalizedSearchCode) {
        console.log(`[SBIS] Товар найден по коду: ${item.name} (код: ${item.nomNumber}, артикул: ${item.article})`)
        return {
          id: item.id,
          name: item.name,
          price: typeof item.cost === 'number' ? item.cost : parseFloat(item.cost) || 0,
          code: item.nomNumber ? String(item.nomNumber).trim() : undefined,
          article: item.article ? String(item.article).trim() : undefined,
          balance: item.balance !== null && item.balance !== undefined ? Number(item.balance) : undefined,
        }
      }
    }

    // Если точного совпадения нет, возвращаем первый найденный товар (возможно, поиск по части кода сработал)
    const firstProduct = nomenclatures.find((item: any) => !item.isParent)
    if (firstProduct) {
      console.log(`[SBIS] Возвращаем первый найденный товар: ${firstProduct.name} (код: ${firstProduct.nomNumber})`)
      return {
        id: firstProduct.id,
        name: firstProduct.name,
        price: typeof firstProduct.cost === 'number' ? firstProduct.cost : parseFloat(firstProduct.cost) || 0,
        code: firstProduct.nomNumber ? String(firstProduct.nomNumber).trim() : undefined,
        article: firstProduct.article ? String(firstProduct.article).trim() : undefined,
        balance: firstProduct.balance !== null && firstProduct.balance !== undefined ? Number(firstProduct.balance) : undefined,
      }
    }

    return null
  } catch (error) {
    console.error(`Ошибка поиска товара по коду "${searchCode}":`, error)
    return null
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
