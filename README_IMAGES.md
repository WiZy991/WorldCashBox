# Инструкция по организации изображений

## Запуск скрипта классификации

Для организации изображений из папки `Photo` запустите:

```bash
node scripts/organize-images.js
```

Или упрощенную версию (обрабатывает первые 50 файлов для теста):

```bash
node scripts/organize-images-simple.js
```

Скрипт:
1. Создаст структуру папок `public/images/products/<category>/`
2. Классифицирует изображения согласно `rules.md`
3. Скопирует изображения в соответствующие категории
4. Создаст файл `catalog.json` с информацией о всех изображениях

## Структура каталога

После запуска будет создан `catalog.json` следующего формата:

```json
{
  "printers": [
    {
      "id": 1,
      "filename": "image.jpg",
      "url": "/images/products/printers/image.jpg"
    }
  ],
  "terminals": [...],
  ...
}
```

## Интеграция с сайтом

После создания `catalog.json` изображения будут доступны по путям вида:
- `/images/products/printers/image.jpg`
- `/images/products/terminals/image.jpg`
и т.д.

