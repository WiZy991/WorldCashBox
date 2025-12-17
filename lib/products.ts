import { Product } from '@/data/products'

/**
 * Загружает товары из API с отключенным кешированием
 */
export async function loadProducts(): Promise<Product[]> {
  try {
    // Добавляем timestamp для cache-busting и случайное число для гарантии уникальности
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const response = await fetch(`/api/products?t=${timestamp}&r=${random}`, {
      cache: 'no-store',
      next: { revalidate: 0 },
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
    
    if (!response.ok) {
      console.error('Failed to fetch products:', response.status, response.statusText)
      return []
    }
    
    const data = await response.json()
    const products = data.products || []
    console.log(`Loaded ${products.length} products from API`)
    return products
  } catch (error) {
    console.error('Error loading products:', error)
    return []
  }
}

