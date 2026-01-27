# Решение проблемы с Git на сервере

## Проблема
Git не может добавить файлы из-за конфликта регистра: `scripts/Photo` уже существует, а вы пытаетесь добавить `scripts/photo`.

## Решение на сервере

Выполните эти команды на сервере:

### 1. Удалите проблемные файлы из индекса Git

```bash
cd /var/www/worldcashbox

# Удалите старые записи из индекса Git
git rm --cached scripts/Photo
git rm --cached scripts/phot  
git rm --cached scripts/photo

# Если есть физические файлы, которые не нужны - удалите их
rm -rf scripts/Photo scripts/phot scripts/photo Photo
```

### 2. Обновите .gitignore (если еще не обновлен)

```bash
# Убедитесь, что .gitignore содержит исключения для Photo
cat >> .gitignore << 'EOF'

# large files and photos
Photo/
scripts/Photo
scripts/phot
scripts/photo
EOF
```

### 3. Добавьте изменения (кроме проблемных файлов)

```bash
# Добавьте все измененные файлы
git add -u

# Добавьте новые файлы (кроме тех, что в .gitignore)
git add .

# Если все еще ошибка, добавьте файлы по одному
git add data/products.json
git add data/products.ts
git add components/
git add app/
# и т.д.
```

### 4. Проверьте, что data/products.json добавлен

```bash
git status | grep products.json
# Должно показать: modified:   data/products.json
```

### 5. Закоммитьте изменения

```bash
git commit -m "Update catalog: add subcategories, multiple images, partners logos"
```

### 6. Отправьте на сервер

```bash
git push origin main
```

## Важно: Сохранение товаров

**ПЕРЕД коммитом убедитесь, что `data/products.json` будет сохранен:**

```bash
# Проверьте, что файл существует и содержит товары
cat data/products.json | head -5

# Проверьте, что он добавлен в Git
git status data/products.json

# Если не добавлен, добавьте явно:
git add data/products.json
```

## Если товары уже на сервере

Если на сервере уже есть товары в `data/products.json`, и вы делаете `git pull` с локальной версией, которая пуста или старая:

1. **Сначала сделайте резервную копию на сервере:**
   ```bash
   cp data/products.json data/products.json.server-backup
   ```

2. **После git pull проверьте:**
   ```bash
   # Если файл был перезаписан и пуст, восстановите из резервной копии
   if [ ! -s data/products.json ]; then
     cp data/products.json.server-backup data/products.json
   fi
   ```

## Быстрое решение (если нужно срочно)

Если нужно быстро закоммитить без проблемных файлов:

```bash
cd /var/www/worldcashbox

# Удалите проблемные файлы из индекса
git rm --cached -r scripts/Photo scripts/phot scripts/photo Photo 2>/dev/null || true

# Добавьте только измененные файлы (не новые)
git add -u

# Добавьте важные новые файлы явно
git add data/products.json
git add data/products.ts
git add components/
git add app/

# Закоммитьте
git commit -m "Update catalog"

# Push
git push origin main
```
