export interface SBISRequest {
  name: string
  phone: string
  email: string
  company?: string
  message?: string
  businessType?: string
  product?: string
  additionalServices?: string[]
  cartItems?: Array<{
    product: {
      name: string
      price?: number
    }
    quantity: number
  }>
}

/**
 * Отправка заявки в СБИС
 * 
 * Для работы требуется:
 * 1. API ключ СБИС
 * 2. Настроенный вебхук или API endpoint
 * 
 * Документация СБИС API: https://sbis.ru/help/integration/api
 */
export async function submitToSBIS(data: SBISRequest): Promise<void> {
  // TODO: Настроить реальную интеграцию с СБИС
  // Пример структуры запроса:
  
  const sbisPayload = {
    // Формат данных для СБИС может отличаться в зависимости от вашей конфигурации
    contact: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      company: data.company || '',
    },
    request: {
      type: 'product_inquiry',
      product: data.product || '',
      business_type: data.businessType || '',
      additional_services: data.additionalServices || [],
      message: data.message || '',
      source: 'website',
      timestamp: new Date().toISOString(),
    },
  }

  // Временная заглушка - в продакшене заменить на реальный API вызов
  const SBIS_API_URL = process.env.NEXT_PUBLIC_SBIS_API_URL || '/api/sbis/submit'
  const SBIS_API_KEY = process.env.SBIS_API_KEY

  if (!SBIS_API_KEY) {
    console.warn('SBIS_API_KEY не настроен. Создайте API endpoint для обработки заявок.')
    // В режиме разработки просто логируем
    console.log('Заявка для СБИС:', sbisPayload)
    return Promise.resolve()
  }

  try {
    const response = await fetch(SBIS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SBIS_API_KEY}`,
      },
      body: JSON.stringify(sbisPayload),
    })

    if (!response.ok) {
      throw new Error(`СБИС API вернул ошибку: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Ошибка отправки в СБИС:', error)
    throw error
  }
}

