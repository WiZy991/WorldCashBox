/**
 * Автоматическое определение категории и подкатегории товара по его названию
 */

import { Product } from '@/data/products'

// Ключевые слова для определения категорий
const categoryKeywords: Record<string, string[]> = {
  equipment: [
    'касса', 'касс', 'pos', 'терминал', 'регистратор', 'фискальный',
    'принтер', 'printer', 'сканер', 'scanner', 'весы', 'scale', 'weight',
    'ящик', 'drawer', 'эквайринг', 'acquiring', 'тсд', 'tsd', 'терминал сбора данных',
    'детектор', 'счетчик', 'банкнот', 'вызов', 'персонал', 'staff',
    'монитор', 'дисплей', 'touch', 'тач', 'планшет', 'tablet',
    'оборудование', 'equipment', 'hardware'
  ],
  consumables: [
    'лента', 'ribbon', 'этикетка', 'label', 'чек', 'receipt', 'бумага', 'paper',
    'картридж', 'cartridge', 'тонер', 'toner', 'расходник', 'consumable',
    'материал', 'material', 'ролик', 'roll'
  ],
  software: [
    'программа', 'программное', 'software', 'по', 'модуль', 'module',
    'система', 'system', 'crm', 'erp', '1с', '1c', 'битрикс', 'bitrix',
    'datamobile', 'клеверенс', 'kleverens', 'далион', 'dalion',
    'frontol', 'фронтол', 'электронная', 'поставка', 'delivery',
    'лицензия', 'license', 'подписка', 'subscription'
  ],
  video: [
    'камера', 'camera', 'видео', 'video', 'наблюдение', 'surveillance',
    'ip-камера', 'ip camera', 'видеокамера', 'видеонаблюдение',
    'кронштейн', 'bracket', 'mount', 'монтаж', 'ups', 'бесперебойник',
    'аккумулятор', 'battery', 'диск', 'disk', 'хранилище', 'storage'
  ],
  services: [
    'услуга', 'service', 'установка', 'installation', 'настройка', 'setup',
    'консультация', 'consultation', 'обслуживание', 'maintenance',
    'маркировка', 'marking', 'автоматизация', 'automation', 'регистрация',
    'регистрация ккт', 'регистрация кассы'
  ]
}

// Ключевые слова для определения подкатегорий
const subcategoryKeywords: Record<string, Record<string, string[]>> = {
  equipment: {
    'smart_cash_registers': ['онлайн-касса', 'онлайн касса', 'online cash', 'smart cash', 'смарт-касса', 'смарт касса', 'эвотор', 'evotor', 'атол', 'atol', 'poscenter'],
    'fiscal_registrars': ['фискальный', 'fiscal', 'регистратор', 'registrar', 'фн', 'fn'],
    'printers': ['принтер', 'printer', 'термопринтер', 'thermal', 'этикеток', 'label', 'чек', 'receipt'],
    'scanners': ['сканер', 'scanner', 'штрих', 'barcode', 'баркод'],
    'weights': ['весы', 'weight', 'scale', 'весовой', 'scales'],
    'drawers': ['ящик', 'drawer', 'денежный', 'cash'],
    'pos': ['pos', 'терминал', 'terminal', 'pos-терминал', 'pos терминал'],
    'acquiring': ['эквайринг', 'acquiring', 'платежный', 'payment'],
    'tsd': ['тсд', 'tsd', 'терминал сбора данных', 'data collection'],
    'banknote': ['детектор', 'счетчик', 'банкнот', 'banknote', 'detector', 'counter'],
    'staff_call': ['вызов', 'персонал', 'staff', 'call', 'система вызова']
  },
  consumables: {
    'consumables_for_printers': ['лента', 'ribbon', 'картридж', 'cartridge', 'тонер', 'toner', 'принтер', 'printer'],
    'consumables_for_scanners': ['сканер', 'scanner', 'этикетка', 'label'],
    'consumables_for_scales': ['весы', 'weight', 'scale', 'весовой']
  },
  software: {
    'datamobile': ['datamobile', 'датамобайл', 'дата мобайл'],
    '1c': ['1с', '1c', 'одинс', 'one c'],
    'kleverens': ['клеверенс', 'kleverens', 'клевер'],
    'dalion': ['далион', 'dalion'],
    'frontol': ['frontol', 'фронтол', 'фронт ол'],
    'electronic_delivery': ['электронная', 'поставка', 'delivery', 'электрон'],
    'accounting': ['учет', 'accounting', 'бухгалтерия', 'bookkeeping'],
    'crm': ['crm', 'крм', 'управление', 'management', 'клиент', 'customer'],
    'restaurant': ['ресторан', 'restaurant', 'кафе', 'cafe', 'общепит'],
    'cloud': ['облако', 'cloud', 'облачный', 'cloudy']
  },
  video: {
    'cameras': ['камера', 'camera', 'ip-камера', 'ip camera'],
    'accessories': ['аксессуар', 'accessory', 'кабель', 'cable', 'блок питания', 'power'],
    'mounting': ['монтаж', 'mounting', 'коробка', 'box', 'монтажная'],
    'brackets': ['кронштейн', 'bracket', 'крепление', 'mount'],
    'ups': ['ups', 'бесперебойник', 'uninterruptible', 'источник питания'],
    'batteries': ['аккумулятор', 'battery', 'батарея'],
    'storage': ['диск', 'disk', 'хранилище', 'storage', 'жесткий', 'hard drive', 'hdd']
  },
  services: {
    'marking': ['маркировка', 'marking', 'маркировать'],
    'automation': ['автоматизация', 'automation', 'автоматизировать'],
    'consulting': ['консультация', 'consulting', 'консультирование', 'помощь', 'help']
  }
}

/**
 * Определяет категорию товара по названию
 */
export function detectCategory(productName: string): Product['category'] {
  const nameLower = productName.toLowerCase()
  
  // Подсчитываем совпадения для каждой категории
  const scores: Record<string, number> = {
    equipment: 0,
    consumables: 0,
    software: 0,
    video: 0,
    services: 0
  }
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (nameLower.includes(keyword.toLowerCase())) {
        scores[category]++
      }
    }
  }
  
  // Находим категорию с максимальным количеством совпадений
  const maxScore = Math.max(...Object.values(scores))
  if (maxScore === 0) {
    // Если не найдено совпадений, используем 'equipment' по умолчанию
    return 'equipment'
  }
  
  const detectedCategory = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as Product['category']
  return detectedCategory || 'equipment'
}

/**
 * Определяет подкатегорию товара по названию и категории
 */
export function detectSubcategory(productName: string, category: Product['category']): string | undefined {
  const nameLower = productName.toLowerCase()
  const subcategories = subcategoryKeywords[category]
  
  if (!subcategories) {
    return undefined
  }
  
  // Подсчитываем совпадения для каждой подкатегории
  const scores: Record<string, number> = {}
  
  for (const [subcategory, keywords] of Object.entries(subcategories)) {
    scores[subcategory] = 0
    for (const keyword of keywords) {
      if (nameLower.includes(keyword.toLowerCase())) {
        scores[subcategory]++
      }
    }
  }
  
  // Находим подкатегорию с максимальным количеством совпадений
  const maxScore = Math.max(...Object.values(scores))
  if (maxScore === 0) {
    return undefined
  }
  
  return Object.entries(scores).find(([_, score]) => score === maxScore)?.[0]
}

/**
 * Генерирует ID товара из названия и кода
 */
export function generateProductId(name: string, code?: string): string {
  // Используем код, если он есть, иначе генерируем из названия
  if (code) {
    // Нормализуем код: убираем пробелы, спецсимволы, приводим к нижнему регистру
    return code.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  }
  
  // Генерируем ID из названия
  const normalized = name
    .toLowerCase()
    .replace(/[^a-zа-я0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) // Ограничиваем длину
  
  return normalized || `product-${Date.now()}`
}

/**
 * Создает описание товара на основе названия
 */
export function generateDescription(name: string, category: Product['category']): string {
  const categoryNames: Record<Product['category'], string> = {
    equipment: 'Оборудование',
    consumables: 'Расходные материалы',
    software: 'Программное обеспечение',
    video: 'Видеонаблюдение',
    services: 'Услуги'
  }
  
  return `${name}. ${categoryNames[category]}.`
}

/**
 * Генерирует список характеристик на основе названия
 */
export function generateFeatures(name: string, category: Product['category']): string[] {
  const features: string[] = []
  const nameLower = name.toLowerCase()
  
  // Добавляем общие характеристики в зависимости от категории
  if (category === 'equipment') {
    if (nameLower.includes('смарт') || nameLower.includes('smart')) {
      features.push('Современное смарт-оборудование')
    }
    if (nameLower.includes('беспроводной') || nameLower.includes('wireless')) {
      features.push('Беспроводное подключение')
    }
    if (nameLower.includes('touch') || nameLower.includes('тач')) {
      features.push('Сенсорный экран')
    }
  }
  
  if (category === 'software') {
    features.push('Лицензионное программное обеспечение')
    if (nameLower.includes('облак') || nameLower.includes('cloud')) {
      features.push('Облачное решение')
    }
  }
  
  // Если не нашли специфических характеристик, добавляем общие
  if (features.length === 0) {
    features.push('Качественный товар')
    features.push('Проверенное решение')
  }
  
  return features
}
