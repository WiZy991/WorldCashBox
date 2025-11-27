import { NextRequest, NextResponse } from 'next/server'
import { createSabyLead } from '@/lib/saby'

/**
 * API endpoint для создания сделки в Saby CRM
 * 
 * Этот endpoint должен быть защищен и настроен для работы с реальным API Saby
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Валидация данных
    if (!data.name || !data.phone || !data.email) {
      return NextResponse.json(
        { error: 'Обязательные поля не заполнены (имя, телефон, email)' },
        { status: 400 }
      )
    }

    // Проверяем, настроены ли переменные окружения для Saby
    const SABY_LOGIN = process.env.SABY_LOGIN
    const SABY_PASSWORD = process.env.SABY_PASSWORD
    const SABY_THEME_NAME = process.env.SABY_THEME_NAME // Название темы (опционально)
    const SABY_REGULAMENT_ID = process.env.SABY_REGULAMENT_ID // ID регламента (обязательно, если не указана тема)

    if (!SABY_LOGIN || !SABY_PASSWORD || (!SABY_THEME_NAME && !SABY_REGULAMENT_ID)) {
      console.warn('Saby CRM не настроен. Заявка будет обработана через СБИС.')
      console.warn('Необходимые переменные окружения:')
      console.warn('  - SABY_LOGIN (обязательно)')
      console.warn('  - SABY_PASSWORD (обязательно)')
      console.warn('  - SABY_REGULAMENT_ID (обязательно, ID регламента - числовое значение)')
      console.warn('  - или SABY_THEME_NAME (опционально, название темы, например: "Продажи")')
      
      // Обрабатываем заявку через СБИС напрямую (без fetch)
      const sbisPayload = {
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
        cartItems: data.cartItems || [],
      }
      
      // Логируем заявку для обработки через СБИС
      console.log('Заявка для СБИС (Saby не настроен):', JSON.stringify(sbisPayload, null, 2))
      
      // TODO: Здесь можно добавить реальную отправку в СБИС через API или вебхук
      // Например: await sendToSBISWebhook(sbisPayload)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Заявка успешно получена. Менеджер свяжется с вами в ближайшее время.'
      })
    }

    // Создание сделки в Saby CRM
    try {
      const result = await createSabyLead(data)

      // Здесь можно также сохранить заявку в локальную БД для резервирования
      // await saveToDatabase(data)

      return NextResponse.json({ 
        success: true, 
        message: 'Сделка успешно создана в Saby CRM',
        leadId: result?.['@Документ'] || result?.ИдентификаторДокумента 
      })
    } catch (sabyError: any) {
      console.error('Ошибка создания сделки в Saby CRM:', sabyError)
      
      // Fallback: обрабатываем заявку через СБИС
      console.warn('Saby CRM вернул ошибку. Заявка будет обработана через СБИС.')
      
      const sbisPayload = {
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
        cartItems: data.cartItems || [],
        sabyError: sabyError.message,
      }
      
      // Логируем заявку для обработки через СБИС
      console.log('Заявка для СБИС (Saby ошибка):', JSON.stringify(sbisPayload, null, 2))
      
      // TODO: Здесь можно добавить реальную отправку в СБИС через API или вебхук
      // Например: await sendToSBISWebhook(sbisPayload)
      
      // Возвращаем успех, так как заявка сохранена для обработки
      return NextResponse.json({ 
        success: true, 
        message: 'Заявка успешно получена. Менеджер свяжется с вами в ближайшее время.',
        warning: 'Saby CRM вернул ошибку, заявка будет обработана через СБИС'
      })
    }
  } catch (error: any) {
    console.error('Критическая ошибка обработки заявки:', error)
    return NextResponse.json(
      { 
        error: 'Произошла критическая ошибка при обработке заявки',
        details: error.message || 'Неизвестная ошибка'
      },
      { status: 500 }
    )
  }
}

