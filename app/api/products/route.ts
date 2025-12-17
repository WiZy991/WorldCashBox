import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { Product } from '@/data/products'

const productsJsonPath = join(process.cwd(), 'data', 'products.json')

// Публичный endpoint для получения товаров
export async function GET() {
  try {
    // Загружаем только товары из админки
    let products: Product[] = []
    try {
      const content = await readFile(productsJsonPath, 'utf-8')
      products = JSON.parse(content)
    } catch {
      // JSON файла нет или пустой - возвращаем пустой массив
      products = []
    }
    
    // Отключаем кеширование для актуальности данных
    return NextResponse.json({ products }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Error reading products:', error)
    return NextResponse.json({ products: [] }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    })
  }
}

