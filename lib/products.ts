import { Product } from '@/data/products'

/**
 * Загружает товары из API с отключенным кешированием
 */
export async function loadProducts(): Promise<Product[]> {
  try {
    // Добавляем timestamp для cache-busting
    const response = await fetch(`/api/products?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
    const data = await response.json()
    return data.products || []
  } catch (error) {
    console.error('Error loading products:', error)
    return []
  }
}

