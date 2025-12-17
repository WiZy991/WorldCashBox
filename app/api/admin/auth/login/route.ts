import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Простая проверка (в продакшене используйте хеширование паролей и базу данных)
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    if (username === adminUsername && password === adminPassword) {
      // Создаем простой токен (в продакшене используйте JWT)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')
      
      const cookieStore = await cookies()
      cookieStore.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 дней
        path: '/',
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Неверные учетные данные' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Ошибка сервера' }, { status: 500 })
  }
}



