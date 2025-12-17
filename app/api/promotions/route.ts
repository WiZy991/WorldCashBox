import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

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

const promotionsFilePath = join(process.cwd(), 'data', 'promotions.json')

// Публичный endpoint для получения акций
export async function GET() {
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
    return NextResponse.json({ promotions: [] })
  }
}



