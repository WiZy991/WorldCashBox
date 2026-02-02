# Решение проблемы на сервере - пошаговая инструкция

## Проблема
1. На сервере есть локальные изменения
2. В origin/main есть новые изменения (1 commit ahead)
3. Git не может сделать pull из-за конфликта

## Решение (выполните на сервере):

### Шаг 1: Сохраните товары (ВАЖНО!)
```bash
cd /var/www/worldcashbox
cp data/products.json data/products.json.server-backup
```

### Шаг 2: Удалите проблемные файлы из индекса Git
```bash
# Удалите конфликтующие файлы из индекса
git rm --cached scripts/Photo scripts/phot scripts/photo 2>/dev/null || true

# Удалите физические файлы/папки
rm -rf scripts/Photo scripts/phot scripts/photo Photo 2>/dev/null || true
```

### Шаг 3: Сохраните локальные изменения (stash)
```bash
# Сохраните все локальные изменения во временное хранилище
git stash push -m "Local server changes before pull"
```

### Шаг 4: Обновите код из репозитория
```bash
# Теперь можно сделать pull
git pull origin main
```

### Шаг 5: Примените локальные изменения обратно
```bash
# Примените сохраненные изменения
git stash pop

# Если есть конфликты, разрешите их вручную
# Или если не нужны локальные изменения, просто:
# git stash drop
```

### Шаг 6: Восстановите товары (если нужно)
```bash
# Проверьте, что товары на месте
if [ ! -s data/products.json ] || [ "$(cat data/products.json | wc -l)" -lt 5 ]; then
  echo "Восстанавливаю товары из резервной копии..."
  cp data/products.json.server-backup data/products.json
fi
```

### Шаг 7: Пересоберите и перезапустите
```bash
# Установите зависимости (если нужно)
npm install

# Пересоберите проект
npm run build

# Перезапустите приложение
pm2 restart worldcashbox

# Проверьте статус
pm2 status
pm2 logs worldcashbox --lines 20
```

## Альтернативный вариант (если локальные изменения не нужны)

Если локальные изменения на сервере не важны, можно просто откатить их:

```bash
cd /var/www/worldcashbox

# Сохраните товары
cp data/products.json data/products.json.server-backup

# Откатите все локальные изменения
git reset --hard origin/main

# Восстановите товары
cp data/products.json.server-backup data/products.json

# Пересоберите
npm run build
pm2 restart worldcashbox
```

## Проверка после обновления

```bash
# Проверьте, что товары на месте
cat data/products.json | head -10

# Проверьте логи
pm2 logs worldcashbox --lines 30

# Проверьте сайт в браузере
curl -I http://localhost:3000
```
