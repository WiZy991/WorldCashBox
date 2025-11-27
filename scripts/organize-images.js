/**
 * Скрипт для организации изображений из папки Photo
 * Классифицирует изображения согласно rules.md и создает структуру каталога
 */

const fs = require('fs');
const path = require('path');

const PHOTO_DIR = path.join(__dirname, '../Photo');
const OUTPUT_DIR = path.join(__dirname, '../public/images/products');
const CATEGORIES = require('../categories.json');

// Создаем структуру папок для всех категорий
Object.keys(CATEGORIES).forEach(category => {
  const categoryDir = path.join(OUTPUT_DIR, category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
    console.log(`✓ Создана папка: ${category}`);
  }
});

// Читаем все файлы из папки Photo
const files = fs.readdirSync(PHOTO_DIR).filter(file => {
  const ext = path.extname(file).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
});

console.log(`\nНайдено ${files.length} изображений для обработки\n`);

// Каталог для хранения информации об изображениях
const catalog = {};

// Базовая классификация по ключевым словам в именах файлов
function classifyImage(filename) {
  const lowerName = filename.toLowerCase();
  
  // Логи и баннеры
  if (lowerName.includes('logo') || lowerName.includes('wcb_logo')) {
    return 'resources_logos';
  }
  if (lowerName.includes('banner') || lowerName.includes('fbbanner')) {
    return 'resources_banners';
  }
  
  // Программное обеспечение
  if (lowerName.includes('ofd') || lowerName.includes('подписка') || lowerName.includes('ключ')) {
    return 'software_ofd';
  }
  if (lowerName.includes('1с') || lowerName.includes('магазин 15') || lowerName.includes('коробка')) {
    return 'software_box';
  }
  
  // Камеры
  if (lowerName.includes('camera') || lowerName.includes('камера') || lowerName.includes('ip') || lowerName.includes('ahd')) {
    return 'cameras';
  }
  
  // ИБП и блоки питания
  if (lowerName.includes('ups') || lowerName.includes('ибп') || lowerName.includes('аккумулятор') || lowerName.includes('батарея') || lowerName.includes('7ah') || lowerName.includes('12ah') || lowerName.includes('18ah')) {
    return 'ups';
  }
  
  // Денежные ящики
  if (lowerName.includes('drawer') || lowerName.includes('ящик') || lowerName.includes('cash')) {
    return 'drawers';
  }
  
  // Весы
  if (lowerName.includes('вес') || lowerName.includes('weight') || lowerName.includes('scale')) {
    return 'weights';
  }
  
  // RFID
  if (lowerName.includes('rfid') || lowerName.includes('nfc') || lowerName.includes('считыватель')) {
    return 'rfid';
  }
  
  // ТСД
  if (lowerName.includes('тсд') || lowerName.includes('tsd') || lowerName.includes('терминал сбора')) {
    return 'tsd';
  }
  
  // Сканеры
  if (lowerName.includes('scanner') || lowerName.includes('сканер') || lowerName.includes('barcode')) {
    return 'scanners';
  }
  
  // Принтеры
  if (lowerName.includes('printer') || lowerName.includes('принтер') || lowerName.includes('термопринтер') || lowerName.includes('чек')) {
    return 'printers';
  }
  
  // Терминалы оплаты
  if (lowerName.includes('terminal') || lowerName.includes('терминал') || lowerName.includes('pinpad') || lowerName.includes('пинпад')) {
    return 'terminals';
  }
  
  // Смарт-кассы
  if (lowerName.includes('smart') || lowerName.includes('смарт') || lowerName.includes('эвотор') || lowerName.includes('evotor')) {
    return 'smart';
  }
  
  // POS-системы
  if (lowerName.includes('pos') || lowerName.includes('моноблок') || lowerName.includes('касса')) {
    return 'pos';
  }
  
  // По умолчанию - прочие ресурсы
  return 'resources_misc';
}

// Обрабатываем каждое изображение
let autoId = 1;
files.forEach(filename => {
  const sourcePath = path.join(PHOTO_DIR, filename);
  const category = classifyImage(filename);
  const categoryDir = path.join(OUTPUT_DIR, category);
  const destPath = path.join(categoryDir, filename);
  
  // Копируем файл (не перемещаем, чтобы сохранить оригиналы)
  try {
    fs.copyFileSync(sourcePath, destPath);
    
    // Добавляем в каталог
    if (!catalog[category]) {
      catalog[category] = [];
    }
    
    catalog[category].push({
      id: autoId++,
      filename: filename,
      url: `/images/products/${category}/${filename}`
    });
    
    console.log(`✓ ${filename} → ${category}`);
  } catch (error) {
    console.error(`✗ Ошибка при копировании ${filename}:`, error.message);
  }
});

// Сохраняем catalog.json
const catalogPath = path.join(__dirname, '../catalog.json');
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');

console.log(`\n✓ Создан файл catalog.json с ${Object.keys(catalog).length} категориями`);
console.log(`✓ Обработано ${files.length} изображений\n`);

