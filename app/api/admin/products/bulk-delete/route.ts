import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { cookies } from 'next/headers'
import { Product } from '@/data/products'

async function checkAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')
  return !!token
}

const productsJsonPath = join(process.cwd(), 'data', 'products.json')

// Массовое удаление товаров
export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { ids } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs array is required' }, { status: 400 })
    }

    // Читаем текущие товары
    let products: Product[] = []
    try {
      const content = await readFile(productsJsonPath, 'utf-8')
      products = JSON.parse(content)
      if (!Array.isArray(products)) {
        products = []
      }
    } catch {
      products = []
    }

    // Удаляем товары с указанными ID
    const initialLength = products.length
    products = products.filter(p => !ids.includes(p.id))
    const deletedCount = initialLength - products.length

    // Сохраняем обновленный список
    await writeFile(productsJsonPath, JSON.stringify(products, null, 2), 'utf-8')

    return NextResponse.json({ 
      success: true, 
      deletedCount,
      totalRemaining: products.length 
    })
  } catch (error) {
    console.error('Error deleting products:', error)
    return NextResponse.json({ error: 'Failed to delete products' }, { status: 500 })
  }
}
