/**
 * Интеграция с Saby CRM
 * 
 * Документация API: https://saby.ru/help/integration/api/app_crm/load_lead
 * 
 * Для работы требуется:
 * 1. Авторизация в Saby (токен доступа)
 * 2. Идентификатор регламента (workflow ID)
 * 3. Идентификатор ответственного за сделку
 */

interface SabyLeadRequest {
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

interface SabyAuthResponse {
  token: string
  expires: number
}

/**
 * Авторизация в Saby API
 * Возвращает токен сессии для использования в последующих запросах
 */
async function authenticateSaby(): Promise<string> {
  const SABY_LOGIN = process.env.SABY_LOGIN
  const SABY_PASSWORD = process.env.SABY_PASSWORD

  if (!SABY_LOGIN || !SABY_PASSWORD) {
    throw new Error('SABY_LOGIN и SABY_PASSWORD должны быть настроены в переменных окружения')
  }

  try {
    // Авторизация в Saby
    // Документация: https://saby.ru/help/integration/api/auth
    const authPayload = {
      jsonrpc: '2.0',
      method: 'СБИС.Аутентифицировать',
      params: {
        Параметр: {
          Логин: SABY_LOGIN,
          Пароль: SABY_PASSWORD,
        },
      },
      protocol: 2,
      id: 0,
    }

    const authResponse = await fetch('https://online.sbis.ru/auth/service/', {
      method: 'POST',
      headers: {
        'Host': 'online.sbis.ru',
        'Content-Type': 'application/json-rpc; charset=utf-8',
        'Accept': 'application/json-rpc',
      },
      body: JSON.stringify(authPayload),
    })

    const responseText = await authResponse.text()
    let authData: any

    try {
      authData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Ошибка парсинга ответа Saby:', responseText)
      throw new Error(`Некорректный ответ от Saby API: ${responseText.substring(0, 200)}`)
    }

    if (!authResponse.ok) {
      const errorMsg = authData?.error?.message || authData?.error || responseText || authResponse.statusText
      throw new Error(`Ошибка авторизации в Saby (HTTP ${authResponse.status}): ${errorMsg}`)
    }
    
    if (authData.error) {
      const errorMsg = authData.error.message || authData.error.data?.message || JSON.stringify(authData.error)
      throw new Error(`Ошибка авторизации: ${errorMsg}`)
    }

    // Токен может быть в разных форматах в зависимости от ответа
    // Обычно это строка или объект с sessionId
    const token = authData.result?.sessionId || authData.result?.token || authData.result
    
    if (!token) {
      console.error('Полный ответ от Saby:', JSON.stringify(authData, null, 2))
      throw new Error('Токен авторизации не получен. Проверьте формат ответа API и учетные данные.')
    }

    return typeof token === 'string' ? token : JSON.stringify(token)
  } catch (error: any) {
    console.error('Ошибка авторизации в Saby:', error)
    // Если это уже наша ошибка, пробрасываем дальше
    if (error.message && error.message.includes('Ошибка авторизации')) {
      throw error
    }
    throw new Error(`Ошибка авторизации в Saby: ${error.message || 'Неизвестная ошибка'}`)
  }
}

/**
 * Получение ID регламента по названию темы
 */
async function getCRMThemeByName(themeName: string, sessionId: string): Promise<number> {
  try {
    const requestBody = {
      jsonrpc: '2.0',
      method: 'CRMLead.getCRMThemeByName',
      params: {
        НаименованиеТемы: themeName,
      },
      protocol: 2,
      id: 0,
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
      console.error('Saby API ошибка при получении темы (HTTP):', response.status, response.statusText)
      console.error('Saby API ответ:', errorText)
      throw new Error(`Saby API вернул ошибку при получении темы: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Saby API ответ (getCRMThemeByName):', JSON.stringify(result, null, 2))

    if (result.error) {
      const errorDetails = result.error.message || result.error.data || JSON.stringify(result.error)
      console.error('Saby API ошибка в ответе:', errorDetails)
      throw new Error(`Ошибка получения темы в Saby: ${errorDetails}`)
    }

    if (!result.result || !result.result.d || !result.result.d.Регламент) {
      console.error('Полный ответ от Saby:', JSON.stringify(result, null, 2))
      throw new Error(`Тема "${themeName}" не найдена или не содержит регламент. Проверьте название темы в Saby CRM.`)
    }

    const regulamentId = result.result.d.Регламент
    console.log(`Найдена тема "${themeName}" с ID регламента: ${regulamentId}`)
    return regulamentId
  } catch (error: any) {
    console.error('Ошибка получения темы CRM:', error)
    throw new Error(`Ошибка получения темы CRM: ${error.message || 'Неизвестная ошибка'}`)
  }
}

/**
 * Создание сделки в Saby CRM
 */
export async function createSabyLead(data: SabyLeadRequest): Promise<any> {
  const SABY_THEME_NAME = process.env.SABY_THEME_NAME // Название темы (опционально)
  const SABY_REGULAMENT_ID = process.env.SABY_REGULAMENT_ID // ID регламента напрямую (обязательно, если не указана тема)
  const SABY_RESPONSIBLE_ID = process.env.SABY_RESPONSIBLE_ID // ID ответственного

  if (!SABY_THEME_NAME && !SABY_REGULAMENT_ID) {
    throw new Error('Необходимо указать либо SABY_THEME_NAME (название темы), либо SABY_REGULAMENT_ID (ID регламента) в переменных окружения')
  }

  try {
    // Авторизация
    const token = await authenticateSaby()
    
    // Получаем sessionId из токена
    let sessionId = token
    if (token.startsWith('{')) {
      const tokenObj = JSON.parse(token)
      sessionId = tokenObj.sessionId || tokenObj.token || token
    }

    // Получаем ID регламента
    let regulamentId: number
    if (SABY_THEME_NAME) {
      // Если указано название темы, получаем ID через API
      console.log('Получение ID регламента для темы:', SABY_THEME_NAME)
      regulamentId = await getCRMThemeByName(SABY_THEME_NAME, sessionId)
    } else if (SABY_REGULAMENT_ID) {
      // Если указан ID регламента напрямую, используем его
      if (!/^\d+$/.test(SABY_REGULAMENT_ID)) {
        throw new Error(`SABY_REGULAMENT_ID должен быть числом, получено: ${SABY_REGULAMENT_ID}`)
      }
      console.log('Используется ID регламента напрямую:', SABY_REGULAMENT_ID)
      regulamentId = parseInt(SABY_REGULAMENT_ID)
    } else {
      throw new Error('Не удалось определить ID регламента')
    }

    // Разбиваем ФИО на части
    const nameParts = data.name.trim().split(/\s+/)
    const surname = nameParts[0] || data.name
    const firstName = nameParts[1] || ''
    const patronymic = nameParts[2] || ''

    // Формируем примечание с информацией о заявке
    let note = ''
    if (data.message) {
      note += data.message + '\n\n'
    }
    if (data.businessType) {
      note += `Тип бизнеса: ${data.businessType}\n`
    }
    if (data.product) {
      note += `Товар/Услуга: ${data.product}\n`
    }
    if (data.cartItems && data.cartItems.length > 0) {
      note += '\nТовары из корзины:\n'
      data.cartItems.forEach((item) => {
        note += `- ${item.product.name} (${item.quantity} шт.)`
        if (item.product.price) {
          note += ` - ${(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽`
        }
        note += '\n'
      })
      const totalPrice = data.cartItems.reduce((sum, item) => 
        sum + (item.product.price || 0) * item.quantity, 0
      )
      note += `\nОбщая сумма: ${totalPrice.toLocaleString('ru-RU')} ₽`
    }
    if (data.additionalServices && data.additionalServices.length > 0) {
      note += `\nДополнительные услуги: ${data.additionalServices.join(', ')}`
    }

    // Формируем список товаров (номенклатура)
    const nomenclatures: any[] = []
    if (data.cartItems && data.cartItems.length > 0) {
      data.cartItems.forEach((item) => {
        nomenclatures.push({
          code: item.product.name,
          price: item.product.price || 0,
          count: item.quantity,
        })
      })
    } else if (data.product) {
      nomenclatures.push({
        code: data.product,
        price: 0,
        count: 1,
      })
    }

    // Формируем UserConds (дополнительные условия)
    const userConds: any = {}
    if (data.businessType) {
      userConds['Тип бизнеса'] = data.businessType
    }
    if (data.cartItems && data.cartItems.length > 0) {
      const totalPrice = data.cartItems.reduce((sum, item) => 
        sum + (item.product.price || 0) * item.quantity, 0
      )
      userConds['Сумма в корзине'] = totalPrice.toString()
    }
    if (data.additionalServices && data.additionalServices.length > 0) {
      userConds['Дополнительные услуги'] = data.additionalServices.join(', ')
    }

    // Формируем параметры для создания сделки согласно документации СБИС
    // Сначала создаем базовую структуру
    const leadData: any = {
      Регламент: regulamentId,
    }

    const leadSchema: any = {
      Регламент: 'Число целое',
    }

    // Добавляем ответственного только если ID указан и валиден
    // Если ID неверный, лучше не указывать поле, чтобы избежать ошибок
    if (SABY_RESPONSIBLE_ID && SABY_RESPONSIBLE_ID.trim() !== '') {
      // Проверяем, что это не тестовое значение
      if (SABY_RESPONSIBLE_ID !== '67890' && SABY_RESPONSIBLE_ID !== '123') {
        leadData.Ответственный = SABY_RESPONSIBLE_ID
        leadSchema.Ответственный = 'Строка'
      } else {
        console.warn('Используется тестовый ID ответственного, пропускаем поле')
      }
    }

    // Добавляем КонтактноеЛицо (обязательное поле для связи с клиентом)
    // Структура должна иметь d и s согласно формату СБИС
    leadData.КонтактноеЛицо = {
      d: {
        ФИО: data.name,
        Телефон: data.phone,
        email: data.email,
        ...(data.company && { Компания: data.company }),
      },
      s: {
        ФИО: 'Строка',
        Телефон: 'Строка',
        email: 'Строка',
        ...(data.company && { Компания: 'Строка' }),
      },
    }
    leadSchema.КонтактноеЛицо = 'Запись'

    // Добавляем примечание
    if (note.trim()) {
      leadData.Примечание = note.trim()
      leadSchema.Примечание = 'Строка'
    }

    // Добавляем источник
    leadData.Источник = 0
    leadSchema.Источник = 'Число целое'

    // Добавляем товары (номенклатуру)
    if (nomenclatures.length > 0) {
      leadData.Nomenclatures = nomenclatures
      leadSchema.Nomenclatures = 'JSON-объект'
    }

    // Добавляем UserConds (дополнительные условия)
    if (Object.keys(userConds).length > 0) {
      leadData.UserConds = userConds
      leadSchema.UserConds = 'JSON-объект'
    }

    // Формируем финальную структуру параметров
    const params = {
      Лид: {
        d: leadData,
        s: leadSchema,
      },
    }

    // Формируем запрос для создания сделки
    const requestBody = {
      jsonrpc: '2.0',
      method: 'CRMLead.insertRecord',
      params: params,
      protocol: 2,
      id: 0,
    }

    console.log('Отправка запроса в Saby CRM:', JSON.stringify(requestBody, null, 2))

    // Отправляем запрос в Saby согласно документации
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
      console.error('Saby API ошибка (HTTP):', response.status, response.statusText)
      console.error('Saby API ответ:', errorText)
      throw new Error(`Saby API вернул ошибку: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Saby API ответ:', JSON.stringify(result, null, 2))

    if (result.error) {
      const errorDetails = result.error.message || result.error.data || JSON.stringify(result.error)
      console.error('Saby API ошибка в ответе:', errorDetails)
      throw new Error(`Ошибка создания сделки в Saby: ${errorDetails}`)
    }

    if (!result.result) {
      console.warn('Saby API вернул ответ без result:', result)
      throw new Error('Saby API вернул ответ без result')
    }

    // Проверяем наличие ошибок в результате
    if (result.result.d?.Errors && result.result.d.Errors.length > 0) {
      const errors = result.result.d.Errors.map((err: any) => err.msg || err.message || JSON.stringify(err)).join('; ')
      console.warn('Saby API вернул предупреждения/ошибки:', errors)
      
      // Проверяем, создалась ли сделка
      const isLeadCreated = result.result.d?.['@Документ'] || result.result.d?.ИдентификаторДокумента
      
      // Если есть критичные ошибки (не только предупреждения), пробрасываем их
      const criticalErrors = result.result.d.Errors.filter((err: any) => {
        // Ошибка с ID ответственного (код 7) не критична, если сделка создалась
        // Ошибка с регламентом (код 20) критична, так как сделка не может быть создана
        return err.code !== 7 || !isLeadCreated
      })
      
      if (criticalErrors.length > 0) {
        // Формируем более информативное сообщение об ошибке
        let errorMessage = `Ошибки при создании сделки в Saby: ${errors}`
        
        // Добавляем подсказки для частых ошибок
        const errorCodes = criticalErrors.map((err: any) => err.code)
        if (errorCodes.includes(20)) {
          errorMessage += '\n\nПодсказка: Убедитесь, что:\n'
          errorMessage += '1. SABY_REGULAMENT_ID указан правильно (ID регламента в Saby CRM)\n'
          errorMessage += '2. В регламенте настроены темы отношений\n'
          errorMessage += '3. У вас есть права на создание сделок в этом регламенте'
        } else if (errorCodes.includes(7)) {
          errorMessage += '\n\nПодсказка: Проверьте правильность SABY_RESPONSIBLE_ID (ID ответственного сотрудника)'
        }
        
        throw new Error(errorMessage)
      }
      
      // Если есть только предупреждения, но сделка создалась, продолжаем
      if (isLeadCreated) {
        console.log('Сделка создана, несмотря на предупреждения')
      }
    }
    
    // Проверяем, что сделка действительно создана
    if (!result.result.d?.['@Документ'] && !result.result.d?.ИдентификаторДокумента) {
      const errorMsg = result.result.d?.Состояние || 'Неизвестная ошибка'
      throw new Error(`Сделка не была создана в Saby CRM. Состояние: ${errorMsg}`)
    }

    return result.result
  } catch (error) {
    console.error('Ошибка создания сделки в Saby CRM:', error)
    throw error
  }
}

/**
 * Универсальная функция отправки заявки
 * Может отправлять как в Saby CRM, так и в СБИС (fallback)
 */
export async function submitLead(data: SabyLeadRequest): Promise<void> {
  const USE_SABY_CRM = process.env.USE_SABY_CRM === 'true'

  if (USE_SABY_CRM) {
    try {
      await createSabyLead(data)
      return
    } catch (error) {
      console.error('Ошибка отправки в Saby CRM, пробуем СБИС:', error)
      // Fallback на СБИС при ошибке
    }
  }

  // Fallback на существующую интеграцию с СБИС
  const { submitToSBIS } = await import('./sbis')
  await submitToSBIS(data)
}

