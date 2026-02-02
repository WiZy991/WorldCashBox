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
    
    // Валидация обязательных полей
    if (!productData.name || typeof productData.name !== 'string' || productData.name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    
    if (!productData.description || typeof productData.description !== 'string' || productData.description.trim() === '') {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }
    
    if (!productData.category || typeof productData.category !== 'string') {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }
    
    // Нормализуем данные товара
    const product: Product = {
      id: productData.id || `product-${Date.now()}`,
      name: (productData.name || '').trim(),
      category: productData.category || 'equipment',
      subcategory: productData.subcategory && typeof productData.subcategory === 'string' && productData.subcategory.trim() !== '' 
        ? productData.subcategory.trim() 
        : undefined,
      price: productData.price !== undefined && productData.price !== null && productData.price !== '' 
        ? Number(productData.price) 
        : undefined,
      description: (productData.description || '').trim(),
      features: Array.isArray(productData.features) ? productData.features.filter((f: any) => typeof f === 'string' && f.trim() !== '') : [],
      image: productData.image && typeof productData.image === 'string' && productData.image.trim() !== '' 
        ? productData.image.trim() 
        : undefined,
      images: Array.isArray(productData.images) ? productData.images.filter((img: any) => typeof img === 'string' && img.trim() !== '') : [],
      specifications: productData.specifications && typeof productData.specifications === 'object' 
        ? productData.specifications 
        : undefined,
      // Поля для интеграции с СБИС
      sbisId: productData.sbisId && (typeof productData.sbisId === 'string' || typeof productData.sbisId === 'number')
        ? (typeof productData.sbisId === 'string' && productData.sbisId.trim() !== '' ? productData.sbisId.trim() : productData.sbisId)
        : undefined,
      sbisPriceListId: productData.sbisPriceListId && typeof productData.sbisPriceListId === 'number'
        ? productData.sbisPriceListId
        : undefined,
      priceUpdatedAt: productData.priceUpdatedAt && typeof productData.priceUpdatedAt === 'string'
        ? productData.priceUpdatedAt
        : undefined,
    }
    
    console.log('Creating product:', {
      id: product.id,
      name: product.name,
      category: product.category,
      hasImage: !!product.image,
      featuresCount: product.features.length
    })
    
    // Читаем текущие товары
    let products: Product[] = []
    try {
      const content = await readFile(productsJsonPath, 'utf-8')
      products = JSON.parse(content)
      if (!Array.isArray(products)) {
        products = []
      }
    } catch (error) {
      console.log('Products file not found or invalid, creating new:', error)
      products = []
    }
    
    // Проверяем, нет ли товара с таким же ID
    const existingIndex = products.findIndex(p => p.id === product.id)
    if (existingIndex >= 0) {
      // Обновляем существующий товар
      products[existingIndex] = product
      console.log('Updated existing product:', product.id)
    } else {
      // Добавляем новый товар
      products.push(product)
      console.log('Added new product:', product.id)
    }

    // Сохраняем в JSON с явной синхронизацией
    const productsJson = JSON.stringify(products, null, 2)
    await writeFile(productsJsonPath, productsJson, 'utf-8')
    
    // Проверяем, что файл действительно записан и содержит новый товар
    try {
      // Небольшая задержка для гарантии записи на диск
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const verifyContent = await readFile(productsJsonPath, 'utf-8')
      const verifyProducts = JSON.parse(verifyContent)
      
      if (!Array.isArray(verifyProducts)) {
        console.error('Saved file does not contain an array!')
        return NextResponse.json({ error: 'Failed to save products' }, { status: 500 })
      }
      
      const savedProduct = verifyProducts.find((p: Product) => p.id === product.id)
      if (!savedProduct) {
        console.error('Saved product not found in file!', product.id)
        return NextResponse.json({ error: 'Product was not saved correctly' }, { status: 500 })
      }
      
      console.log('Product saved successfully. Total products:', verifyProducts.length)
      console.log('Saved product:', { id: savedProduct.id, name: savedProduct.name, category: savedProduct.category })
    } catch (verifyError) {
      console.error('Error verifying saved product:', verifyError)
      // Не возвращаем ошибку, так как файл мог быть записан, но проверка не прошла
    }
    
    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error creating product:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create product'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

