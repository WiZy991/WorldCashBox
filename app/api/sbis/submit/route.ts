import { NextRequest, NextResponse } from 'next/server'
import { submitToSBIS } from '@/lib/sbis'

/**
 * API endpoint для отправки заявок в СБИС
 * 
 * Этот endpoint должен быть защищен и настроен для работы с реальным API СБИС
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Валидация данных
    if (!data.name || !data.phone || !data.email) {
      return NextResponse.json(
        { error: 'Обязательные поля не заполнены' },
        { status: 400 }
      )
    }

    // Отправка в СБИС
    await submitToSBIS(data)

    // Здесь можно также сохранить заявку в локальную БД для резервирования
    // await saveToDatabase(data)

    return NextResponse.json({ success: true, message: 'Заявка успешно отправлена' })
  } catch (error) {
    console.error('Ошибка обработки заявки:', error)
    return NextResponse.json(
      { error: 'Произошла ошибка при обработке заявки' },
      { status: 500 }
    )
  }
}

