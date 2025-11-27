/**
 * Утилита для сопоставления товаров с изображениями из catalog.json
 */

import catalogData from '../catalog.json'

export interface CatalogImage {
  id: number
  filename: string
  url: string
}

export interface Catalog {
  [category: string]: CatalogImage[]
}

const catalog = catalogData as Catalog

/**
 * Получить изображения для категории товара
 */
export function getImagesForCategory(productCategory: string, productName: string): string[] {
  // Маппинг категорий товаров на категории каталога
  const categoryMap: Record<string, string[]> = {
    equipment: ['pos', 'printers', 'scanners', 'terminals', 'smart', 'weights', 'tsd', 'drawers', 'ups', 'rfid', 'rf_modules', 'pos_keyboards'],
    consumables: ['printers'], // Расходники часто связаны с принтерами
    software: ['software_ofd', 'software_box'],
    video: ['cameras'],
    services: [] // Услуги обычно не имеют изображений
  }

  const mappedCategories = categoryMap[productCategory] || []
  
  // Ищем подходящие изображения
  const images: string[] = []
  
  mappedCategories.forEach(cat => {
    if (catalog[cat] && catalog[cat].length > 0) {
      // Берем первое изображение из категории
      images.push(catalog[cat][0].url)
    }
  })

  // Если не нашли, используем изображения из resources_misc как fallback
  if (images.length === 0 && catalog.resources_misc && catalog.resources_misc.length > 0) {
    images.push(catalog.resources_misc[0].url)
  }

  return images
}

/**
 * Получить изображение для товара по имени (поиск по ключевым словам)
 */
export function getImageForProduct(productName: string, productCategory: string): string | undefined {
  const lowerName = productName.toLowerCase()
  
  // Определяем категорию каталога по названию товара
  let catalogCategory: string | undefined

  if (lowerName.includes('принтер') || lowerName.includes('printer')) {
    catalogCategory = 'printers'
  } else if (lowerName.includes('сканер') || lowerName.includes('scanner')) {
    catalogCategory = 'scanners'
  } else if (lowerName.includes('терминал') || lowerName.includes('terminal') || lowerName.includes('пинпад')) {
    catalogCategory = 'terminals'
  } else if (lowerName.includes('эвотор') || lowerName.includes('evotor') || lowerName.includes('смарт')) {
    catalogCategory = 'smart'
  } else if (lowerName.includes('pos') || lowerName.includes('моноблок')) {
    catalogCategory = 'pos'
  } else if (lowerName.includes('весы') || lowerName.includes('вес')) {
    catalogCategory = 'weights'
  } else if (lowerName.includes('тсд')) {
    catalogCategory = 'tsd'
  } else if (lowerName.includes('камера') || lowerName.includes('camera')) {
    catalogCategory = 'cameras'
  } else if (lowerName.includes('ибп') || lowerName.includes('ups') || lowerName.includes('аккумулятор')) {
    catalogCategory = 'ups'
  } else if (lowerName.includes('ящик') || lowerName.includes('drawer')) {
    catalogCategory = 'drawers'
  }

  // Если нашли категорию, берем первое изображение
  if (catalogCategory && catalog[catalogCategory] && catalog[catalogCategory].length > 0) {
    return catalog[catalogCategory][0].url
  }

  // Fallback: используем общие изображения категории
  const categoryImages = getImagesForCategory(productCategory, productName)
  return categoryImages[0]
}

