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
    'smart_cash_registers': [
      'онлайн-касса', 'онлайн касса', 'online cash', 'smart cash', 'смарт-касса', 'смарт касса',
      'эвотор', 'evotor', 'evotor-', 'evotor ', 'эвотор-', 'эвотор ',
      'атол', 'atol', 'atol-', 'atol ', 'атол-', 'атол ',
      'poscenter', 'pos-center', 'pos центр', 'pos-центр',
      'инкассатор', 'инкассация', 'смарт-терминал', 'smart terminal'
    ],
    'fiscal_registrars': ['фискальный', 'fiscal', 'регистратор', 'registrar', 'фн-', 'фн ', 'фн.', 'fn-', 'fn ', 'fn.'],
    'printers': ['принтер', 'printer', 'термопринтер', 'thermal', 'этикеток', 'label', 'чек', 'receipt', 'печать'],
    'scanners': ['сканер', 'scanner', 'штрих', 'barcode', 'баркод', 'qr', 'qr-'],
    'weights': ['весы', 'weight', 'scale', 'весовой', 'scales', 'весоизмерительный'],
    'drawers': ['ящик', 'drawer', 'денежный', 'cash', 'кассовый ящик'],
    'pos': ['pos-', 'pos ', 'pos-терминал', 'pos терминал', 'pos-система', 'pos система', 'pos-компьютер'],
    'acquiring': ['эквайринг', 'acquiring', 'платежный', 'payment', 'пин-пад', 'pinpad'],
    'tsd': ['тсд', 'tsd', 'терминал сбора данных', 'data collection', 'терминал сбора'],
    'banknote': ['детектор', 'счетчик', 'банкнот', 'banknote', 'detector', 'counter', 'валютный'],
    'staff_call': ['вызов', 'персонал', 'staff', 'call', 'система вызова', 'вызов персонала']
  },
  consumables: {
    'consumables_for_printers': [
      'лента', 'ribbon', 'картридж', 'cartridge', 'тонер', 'toner',
      'чековая лента', 'receipt paper', 'термолента', 'thermal ribbon',
      'ролик', 'roll', 'рулон', 'бумага для принтера', 'paper for printer'
    ],
    'consumables_for_scanners': [
      'этикетка', 'label', 'наклейка', 'sticker',
      'этикетка для сканера', 'label for scanner'
    ],
    'consumables_for_scales': [
      'весовой', 'weight', 'scale', 'весы',
      'этикетка для весов', 'label for scale', 'весовая этикетка'
    ]
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
 * Использует приоритетную логику: сначала проверяет специфичные бренды/модели, затем общие ключевые слова
 */
export function detectCategory(productName: string): Product['category'] {
  const nameLower = productName.toLowerCase()
  
  // ПРИОРИТЕТ 1: Специфичные бренды и модели оборудования (высокий приоритет)
  const equipmentBrands = [
    'эвотор', 'evotor', 'атол', 'atol', 'poscenter', 'pos-center', 'pos центр',
    'инкассатор', 'инкассация', 'счетчик банкнот', 'детектор банкнот',
    'терминал', 'касса', 'регистратор', 'фискальный', 'фн-', 'фн ',
    'сканер', 'scanner', 'принтер', 'printer', 'весы', 'scale', 'weight',
    'тсд', 'tsd', 'терминал сбора данных', 'эквайринг', 'acquiring',
    'денежный ящик', 'cash drawer', 'drawer', 'ящик', 'монитор', 'дисплей',
    'touch', 'тач', 'планшет', 'tablet', 'pos-', 'pos ', 'pos-терминал'
  ]
  
  // ПРИОРИТЕТ 2: Расходные материалы (только если НЕ оборудование)
  const consumablesKeywords = [
    'лента', 'ribbon', 'этикетка', 'label', 'чек', 'receipt', 'бумага', 'paper',
    'картридж', 'cartridge', 'тонер', 'toner', 'расходник', 'consumable',
    'ролик', 'roll', 'рулон', 'наклейка', 'sticker'
  ]
  
  // ПРИОРИТЕТ 3: Программное обеспечение
  const softwareKeywords = [
    'программа', 'программное', 'software', 'по', 'модуль', 'module',
    'система', 'system', 'crm', 'erp', '1с', '1c', 'битрикс', 'bitrix',
    'datamobile', 'клеверенс', 'kleverens', 'далион', 'dalion',
    'frontol', 'фронтол', 'электронная поставка', 'delivery',
    'лицензия', 'license', 'подписка', 'subscription', 'офд', 'ofd'
  ]
  
  // ПРИОРИТЕТ 4: Видеонаблюдение
  const videoKeywords = [
    'камера', 'camera', 'видео', 'video', 'наблюдение', 'surveillance',
    'ip-камера', 'ip camera', 'видеокамера', 'видеонаблюдение',
    'кронштейн', 'bracket', 'mount', 'монтаж', 'ups', 'бесперебойник',
    'аккумулятор', 'battery', 'диск', 'disk', 'хранилище', 'storage', 'hdd'
  ]
  
  // ПРИОРИТЕТ 5: Услуги
  const servicesKeywords = [
    'услуга', 'service', 'установка', 'installation', 'настройка', 'setup',
    'консультация', 'consultation', 'обслуживание', 'maintenance',
    'маркировка', 'marking', 'автоматизация', 'automation', 
    'регистрация', 'registration', 'регистрация ккт', 'регистрация кассы',
    'регистрация в гос', 'регистрация в государственн', 'регистрация в системе',
    'гос система', 'государственн система', 'государственная система',
    'офд', 'ofd', 'эдо', 'электронн документооборот'
  ]
  
  // Сначала проверяем оборудование (высокий приоритет)
  for (const brand of equipmentBrands) {
    if (nameLower.includes(brand)) {
      // Дополнительная проверка: если это расходный материал для оборудования, все равно equipment
      // Например: "Лента для принтера Эвотор" - это equipment, а не consumables
      return 'equipment'
    }
  }
  
  // Затем проверяем расходные материалы (только если точно не оборудование)
  for (const keyword of consumablesKeywords) {
    if (nameLower.includes(keyword)) {
      // Проверяем, не является ли это частью названия оборудования
      // Например: "Принтер этикеток" - это equipment, а не consumables
      if (nameLower.includes('принтер') || nameLower.includes('printer') || 
          nameLower.includes('сканер') || nameLower.includes('scanner')) {
        return 'equipment'
      }
      return 'consumables'
    }
  }
  
  // Проверяем программное обеспечение
  for (const keyword of softwareKeywords) {
    if (nameLower.includes(keyword)) {
      return 'software'
    }
  }
  
  // Проверяем видеонаблюдение
  for (const keyword of videoKeywords) {
    if (nameLower.includes(keyword)) {
      return 'video'
    }
  }
  
  // Проверяем услуги
  for (const keyword of servicesKeywords) {
    if (nameLower.includes(keyword)) {
      return 'services'
    }
  }
  
  // Дополнительная проверка: слова, которые точно НЕ относятся к оборудованию
  const nonEquipmentKeywords = [
    'акселерационн', 'акселерация', 'ускорение', 'развитие', 'бизнес', 'бизнес-',
    'производств', 'производственн', 'смсп', 'смп', 'малый бизнес',
    'цифровизац', 'цифров', 'внедрение', 'внедр',
    'конкурс', 'победитель', 'программа', 'программ', 'пакет услуг',
    'региональн', 'центр', 'инжиниринг', 'инжиниринга',
    'стратеги', 'стратегия', 'индивидуальн', 'реализац',
    'выплата', 'агентск', 'вознагражден', 'акт', 'услуг',
    'доплата', 'выезд', 'заезд', 'поздн', 'ранн',
    'драйвер', 'driver', 'софт', 'soft', 'unipos', 'inpas',
    'swapdog', 'эдо', 'мес', 'месяц'
  ]
  
  // Если название содержит слова, которые точно не относятся к оборудованию
  for (const keyword of nonEquipmentKeywords) {
    if (nameLower.includes(keyword)) {
      // Проверяем, не является ли это услугой или ПО
      if (nameLower.includes('услуг') || nameLower.includes('service') || 
          nameLower.includes('драйвер') || nameLower.includes('driver') ||
          nameLower.includes('программ') || nameLower.includes('software') ||
          nameLower.includes('модуль') || nameLower.includes('module')) {
        return 'software'
      }
      if (nameLower.includes('услуг') || nameLower.includes('service') ||
          nameLower.includes('акселерационн') || nameLower.includes('консультац') ||
          nameLower.includes('установк') || nameLower.includes('настройк')) {
        return 'services'
      }
      // Если не подходит ни к одной категории, но точно не оборудование - ставим services
      return 'services'
    }
  }
  
  // По умолчанию - оборудование (но это может быть неточно)
  // ВАЖНО: Для более точной категоризации рекомендуется вручную проверять товары
  return 'equipment'
}

/**
 * Определяет подкатегорию товара по названию и категории
 * Использует приоритетную логику для более точного определения
 */
export function detectSubcategory(productName: string, category: Product['category']): string | undefined {
  const nameLower = productName.toLowerCase()
  const subcategories = subcategoryKeywords[category]
  
  if (!subcategories) {
    return undefined
  }
  
  // ПРИОРИТЕТ 1: Проверяем специфичные бренды и модели (высокий приоритет)
  if (category === 'equipment') {
    // Эвотор и АТОЛ - всегда онлайн-кассы
    if (nameLower.includes('эвотор') || nameLower.includes('evotor') ||
        nameLower.includes('атол') || nameLower.includes('atol')) {
      // Проверяем, не является ли это фискальным регистратором
      if (nameLower.includes('фискальный') || nameLower.includes('фн-') || nameLower.includes('фн ')) {
        return 'fiscal_registrars'
      }
      return 'smart_cash_registers'
    }
    
    // POSCenter - онлайн-кассы
    if (nameLower.includes('poscenter') || nameLower.includes('pos-center') || nameLower.includes('pos центр')) {
      return 'smart_cash_registers'
    }
    
    // Фискальные регистраторы (проверяем до общих терминов)
    if (nameLower.includes('фискальный') || nameLower.includes('фн-') || nameLower.includes('фн ') || nameLower.includes('фн.')) {
      return 'fiscal_registrars'
    }
    
    // Принтеры (проверяем до сканеров, так как могут быть принтеры-сканеры)
    if (nameLower.includes('принтер') || nameLower.includes('printer')) {
      return 'printers'
    }
    
    // Сканеры
    if (nameLower.includes('сканер') || nameLower.includes('scanner')) {
      return 'scanners'
    }
    
    // Весы
    if (nameLower.includes('весы') || nameLower.includes('weight') || nameLower.includes('scale')) {
      return 'weights'
    }
    
    // Денежные ящики
    if (nameLower.includes('ящик') || nameLower.includes('drawer') || 
        (nameLower.includes('денежный') && nameLower.includes('ящик'))) {
      return 'drawers'
    }
    
    // ТСД
    if (nameLower.includes('тсд') || nameLower.includes('tsd') || nameLower.includes('терминал сбора данных')) {
      return 'tsd'
    }
    
    // Детекторы и счетчики банкнот
    if (nameLower.includes('детектор') || nameLower.includes('счетчик') || 
        nameLower.includes('банкнот') || nameLower.includes('banknote') ||
        nameLower.includes('инкассатор') || nameLower.includes('инкассация')) {
      return 'banknote'
    }
    
    // Эквайринг
    if (nameLower.includes('эквайринг') || nameLower.includes('acquiring') || 
        nameLower.includes('пин-пад') || nameLower.includes('pinpad')) {
      return 'acquiring'
    }
    
    // Системы вызова персонала
    if (nameLower.includes('вызов') && nameLower.includes('персонал')) {
      return 'staff_call'
    }
    
    // POS-терминалы (общий термин, проверяем в конце)
    if (nameLower.includes('pos-') || nameLower.includes('pos ') || nameLower.includes('pos-терминал')) {
      return 'pos'
    }
  }
  
  // ПРИОРИТЕТ 2: Общая логика подсчета совпадений для остальных категорий
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
