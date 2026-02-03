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

// Обновить товар
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const productData: any = await request.json()
    
    // Нормализуем данные товара
    const updatedProduct: Product = {
      id: params.id,
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
      // Поля для интеграции с СБИС
      sbisId: productData.sbisId && (typeof productData.sbisId === 'string' || typeof productData.sbisId === 'number')
        ? (typeof productData.sbisId === 'string' && productData.sbisId.trim() !== '' 
            ? productData.sbisId.trim().replace(/\/+$/, '') // Убираем лишние слэши в конце
            : productData.sbisId)
        : undefined,
      sbisPriceListId: productData.sbisPriceListId && typeof productData.sbisPriceListId === 'number'
        ? productData.sbisPriceListId
        : undefined,
      priceUpdatedAt: productData.priceUpdatedAt && typeof productData.priceUpdatedAt === 'string'
        ? productData.priceUpdatedAt
        : undefined,
      stock: productData.stock !== undefined && productData.stock !== null && productData.stock !== '' 
        ? Number(productData.stock) 
        : undefined,
      inStock: productData.inStock !== undefined && productData.inStock !== null
        ? Boolean(productData.inStock)
        : (productData.stock !== undefined && productData.stock !== null && Number(productData.stock) > 0),
      stockUpdatedAt: productData.stockUpdatedAt && typeof productData.stockUpdatedAt === 'string'
        ? productData.stockUpdatedAt
        : undefined,
      sbisWarehouseId: productData.sbisWarehouseId && typeof productData.sbisWarehouseId === 'string' && productData.sbisWarehouseId.trim() !== ''
        ? productData.sbisWarehouseId.trim()
        : undefined,
    }
    
    let products: Product[] = []
    try {
      const content = await readFile(productsJsonPath, 'utf-8')
      products = JSON.parse(content)
    } catch {
      products = []
    }
    
    const index = products.findIndex(p => p.id === params.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    products[index] = updatedProduct
    
    await writeFile(productsJsonPath, JSON.stringify(products, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true, product: products[index] })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// Удалить товар
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let products: Product[] = []
    try {
      const content = await readFile(productsJsonPath, 'utf-8')
      products = JSON.parse(content)
    } catch {
      products = []
    }
    
    products = products.filter(p => p.id !== params.id)
    
    await writeFile(productsJsonPath, JSON.stringify(products, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

