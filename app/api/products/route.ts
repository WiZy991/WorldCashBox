import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { Product } from '@/data/products'

// Отключаем кеширование этого route
export const dynamic = 'force-dynamic'
export const revalidate = 0

const productsJsonPath = join(process.cwd(), 'data', 'products.json')

// Публичный endpoint для получения товаров
export async function GET() {
  try {
    // Загружаем только товары из админки
    let products: Product[] = []
    try {
      const content = await readFile(productsJsonPath, 'utf-8')
      products = JSON.parse(content)
      
      // Проверяем, что это массив
      if (!Array.isArray(products)) {
        console.warn('Products file does not contain an array, resetting to empty array')
        products = []
      }
      
      console.log(`Loaded ${products.length} products from file`)
    } catch (error) {
      // JSON файла нет или пустой - возвращаем пустой массив
      console.log('Products file not found or invalid, returning empty array:', error)
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

