const fs = require('fs');
const path = require('path');

// Исправляем пути
const PHOTO_DIR = path.resolve(__dirname, '..', 'Photo');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'images', 'products');
const CATEGORIES_FILE = path.resolve(__dirname, '..', 'categories.json');

// Загружаем категории
const CATEGORIES = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));

// Создаем структуру папок
Object.keys(CATEGORIES).forEach(category => {
  const categoryDir = path.join(OUTPUT_DIR, category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }
});

// Читаем файлы
const files = fs.readdirSync(PHOTO_DIR).filter(file => {
  const ext = path.extname(file).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) && !file.includes('logo') && !file.includes('banner');
});

const catalog = {};

function classifyImage(filename) {
  const lowerName = filename.toLowerCase();
  
  if (lowerName.includes('logo') || lowerName.includes('wcb_logo')) return 'resources_logos';
  if (lowerName.includes('banner') || lowerName.includes('fbbanner')) return 'resources_banners';
  if (lowerName.includes('ofd')) return 'software_ofd';
  if (lowerName.includes('1с') || lowerName.includes('магазин')) return 'software_box';
  if (lowerName.includes('camera') || lowerName.includes('камера')) return 'cameras';
  if (lowerName.includes('ups') || lowerName.includes('ибп') || lowerName.includes('7ah') || lowerName.includes('12ah')) return 'ups';
  if (lowerName.includes('drawer') || lowerName.includes('ящик')) return 'drawers';
  if (lowerName.includes('вес') || lowerName.includes('weight')) return 'weights';
  if (lowerName.includes('rfid') || lowerName.includes('nfc')) return 'rfid';
  if (lowerName.includes('тсд') || lowerName.includes('tsd')) return 'tsd';
  if (lowerName.includes('scanner') || lowerName.includes('сканер')) return 'scanners';
  if (lowerName.includes('printer') || lowerName.includes('принтер')) return 'printers';
  if (lowerName.includes('terminal') || lowerName.includes('пинпад') || lowerName.includes('pinpad')) return 'terminals';
  if (lowerName.includes('smart') || lowerName.includes('эвотор') || lowerName.includes('evotor')) return 'smart';
  if (lowerName.includes('pos') || lowerName.includes('моноблок')) return 'pos';
  
  return 'resources_misc';
}

let autoId = 1;
files.slice(0, 50).forEach(filename => { // Обрабатываем первые 50 для теста
  const sourcePath = path.join(PHOTO_DIR, filename);
  const category = classifyImage(filename);
  const categoryDir = path.join(OUTPUT_DIR, category);
  const destPath = path.join(categoryDir, filename);
  
  try {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      
      if (!catalog[category]) catalog[category] = [];
      
      catalog[category].push({
        id: autoId++,
        filename: filename,
        url: `/images/products/${category}/${filename}`
      });
    }
  } catch (error) {
    console.error(`Error: ${filename}`, error.message);
  }
});

// Сохраняем catalog.json
fs.writeFileSync(path.resolve(__dirname, '..', 'catalog.json'), JSON.stringify(catalog, null, 2), 'utf8');
console.log('Done! Created catalog.json');

