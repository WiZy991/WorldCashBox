import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { cookies } from 'next/headers'

interface Promotion {
  id: number
  title: string
  description: string
  date: string
  validUntil: string
  badge?: string
  image: string
  productName?: string
}

async function checkAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')
  return !!token
}

const promotionsFilePath = join(process.cwd(), 'data', 'promotions.json')

// Получить все акции (только для админа)
export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let promotions: Promotion[] = []
    try {
      const content = await readFile(promotionsFilePath, 'utf-8')
      promotions = JSON.parse(content)
    } catch {
      // Файл не существует, возвращаем пустой массив
    }
    return NextResponse.json({ promotions })
  } catch (error) {
    console.error('Error reading promotions:', error)
    return NextResponse.json({ error: 'Failed to read promotions' }, { status: 500 })
  }
}

// Создать новую акцию
export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const promotion: Promotion = await request.json()
    
    let promotions: Promotion[] = []
    try {
      const content = await readFile(promotionsFilePath, 'utf-8')
      promotions = JSON.parse(content)
    } catch {
      // Файл не существует
    }

    // Генерируем ID
    if (!promotion.id) {
      promotion.id = promotions.length > 0 
        ? Math.max(...promotions.map(p => p.id)) + 1 
        : 1
    }

    promotions.push(promotion)
    await writeFile(promotionsFilePath, JSON.stringify(promotions, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true, promotion })
  } catch (error) {
    console.error('Error creating promotion:', error)
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 })
  }
}

