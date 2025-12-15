import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { cookies } from 'next/headers'
import { Product } from '@/data/products'

// Проверка аутентификации
async function checkAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')
  return !!token
}

const productsJsonPath = join(process.cwd(), 'data', 'products.json')

// Получить все товары
export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Сначала пробуем прочитать из JSON файла
    let products: Product[] = []
    try {
      const content = await readFile(productsJsonPath, 'utf-8')
      products = JSON.parse(content)
    } catch {
      // Если JSON файла нет, импортируем из TypeScript и сохраняем в JSON
      try {
        const productsModule = await import('@/data/products')
        products = productsModule.products
        await writeFile(productsJsonPath, JSON.stringify(products, null, 2), 'utf-8')
      } catch {
        products = []
        await writeFile(productsJsonPath, JSON.stringify(products, null, 2), 'utf-8')
      }
    }
    
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error reading products:', error)
    return NextResponse.json({ error: 'Failed to read products' }, { status: 500 })
  }
}

// Создать новый товар
export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const productData: any = await request.json()
    
    // Нормализуем данные товара
    const product: Product = {
      id: productData.id || `product-${Date.now()}`,
      name: productData.name || '',
      category: productData.category || 'equipment',
      subcategory: productData.subcategory && productData.subcategory.trim() !== '' 
        ? productData.subcategory 
        : undefined,
      price: productData.price !== undefined && productData.price !== null && productData.price !== '' 
        ? Number(productData.price) 
        : undefined,
      description: productData.description || '',
      features: Array.isArray(productData.features) ? productData.features : [],
      image: productData.image || undefined,
      images: Array.isArray(productData.images) ? productData.images : [],
      specifications: productData.specifications || undefined,
    }
    
    // Читаем текущие товары
    let products: Product[] = []
    try {
      const content = await readFile(productsJsonPath, 'utf-8')
      products = JSON.parse(content)
    } catch {
      // Если JSON файла нет, импортируем из TypeScript
      try {
        const productsModule = await import('@/data/products')
        products = productsModule.products
        await writeFile(productsJsonPath, JSON.stringify(products, null, 2), 'utf-8')
      } catch {
        products = []
      }
    }
    
    products.push(product)

    // Сохраняем в JSON
    await writeFile(productsJsonPath, JSON.stringify(products, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

