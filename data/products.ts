export interface Product {
  id: string
  name: string
  category: 'equipment' | 'consumables' | 'software' | 'video' | 'services'
  subcategory?: string // Подкатегория товара (например: 'drawers', 'printers', 'scanners', 'smart', 'pos', 'weights', 'tsd', 'terminals', 'cameras', 'ups', 'rfid', 'rf_modules', 'pos_keyboards', 'software_ofd', 'software_box', 'banknote_counters', 'banknote_detectors', 'fiscal_storage')
  price?: number
  image?: string
  images?: string[] // Массив изображений для разных ракурсов (3D эффект)
  description: string
  features: string[]
  specifications?: Record<string, string>
  // Поля для интеграции с СБИС
  sbisId?: string | number // ID товара в СБИС (артикул или идентификатор)
  sbisPriceListId?: number // ID прайс-листа в СБИС
  priceUpdatedAt?: string // Дата последнего обновления цены из СБИС
  stock?: number // Количество товара на складе
  inStock?: boolean // Наличие товара (true если stock > 0)
  stockUpdatedAt?: string // Дата последнего обновления остатков из СБИС
  sbisWarehouseId?: string // ID склада в СБИС (UUID)
}

// Статические товары удалены - все товары теперь управляются через админ панель
export const products: Product[] = []

export const categories = [
  { id: 'equipment', name: 'Оборудование', icon: '🖥️' },
  { id: 'consumables', name: 'Расходные материалы', icon: '📄' },
  { id: 'software', name: 'Программное обеспечение', icon: '💾' },
  { id: 'video', name: 'Видеонаблюдение', icon: '📹' },
  { id: 'services', name: 'Услуги', icon: '🔧' },
]

export const subcategories: Record<string, string[]> = {
  equipment: [
    'drawers',
    'fiscal_registrars',
    'smart_cash_registers',
    'printers',
    'scanners',
    'weights',
    'pos',
    'acquiring',
    'tsd',
    'banknote',
    'staff_call',
    'banknote_counters',
    'banknote_detectors',
    'fiscal_storage',
  ],
  consumables: [
    'consumables_for_printers',
    'consumables_for_scanners',
    'consumables_for_scales',
  ],
  software: [
    'accounting',
    'crm',
    'restaurant',
    'cloud',
    'datamobile',
    '1c',
    'kleverens',
    'dalion',
    'frontol',
    'electronic_delivery',
  ],
  video: [
    'cameras',
    'accessories',
    'mounting',
    'brackets',
    'ups',
    'batteries',
    'storage',
  ],
  services: [
    'marking',
    'automation',
    'consulting',
  ],
}
