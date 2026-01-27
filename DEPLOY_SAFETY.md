# Безопасный деплой - сохранение данных

## ⚠️ ВАЖНО: Товары хранятся в файле `data/products.json`

При деплое на сервер **НЕ УДАЛЯЙТЕ** файл `data/products.json`, иначе все товары будут потеряны!

## Как безопасно обновить сайт

### Вариант 1: Деплой через Git (рекомендуется)

Если используете Git для деплоя:

1. **Убедитесь, что `data/products.json` в репозитории:**
   ```bash
   git add data/products.json
   git commit -m "Сохранить товары"
   git push
   ```

2. **На сервере обновите код:**
   ```bash
   cd /var/www/worldcashbox  # или путь к вашему проекту
   git pull
   npm install
   npm run build
   pm2 restart worldcashbox
   ```

   ✅ Товары сохранятся, так как файл в репозитории

### Вариант 2: Деплой через FTP/SFTP (осторожно!)

Если загружаете файлы через FTP:

1. **ПЕРЕД деплоем сделайте резервную копию на сервере:**
   ```bash
   # На сервере
   cp data/products.json data/products.json.backup
   ```

2. **Загрузите новые файлы (НО НЕ ПЕРЕЗАПИСЫВАЙТЕ `data/products.json`):**
   - Загрузите все файлы кроме `data/products.json`
   - Или загрузите `data/products.json` только если уверены, что локальная версия актуальнее

3. **После деплоя проверьте:**
   ```bash
   # Проверьте, что товары на месте
   cat data/products.json | head -20
   ```

### Вариант 3: Резервное копирование перед деплоем

**Создайте скрипт для безопасного деплоя:**

```bash
#!/bin/bash
# safe-deploy.sh

# 1. Создаем резервную копию на сервере
ssh user@server "cp /var/www/worldcashbox/data/products.json /var/www/worldcashbox/data/products.json.backup.$(date +%Y%m%d_%H%M%S)"

# 2. Загружаем файлы (кроме data/products.json)
rsync -av --exclude 'data/products.json' ./ user@server:/var/www/worldcashbox/

# 3. Восстанавливаем товары, если файл был случайно удален
ssh user@server "if [ ! -f /var/www/worldcashbox/data/products.json ]; then cp /var/www/worldcashbox/data/products.json.backup.* /var/www/worldcashbox/data/products.json; fi"

# 4. Перезапускаем приложение
ssh user@server "cd /var/www/worldcashbox && npm run build && pm2 restart worldcashbox"
```

## Что НЕ нужно делать

❌ **НЕ удаляйте** папку `data/` на сервере  
❌ **НЕ перезаписывайте** `data/products.json` без резервной копии  
❌ **НЕ делайте** `rm -rf data/` перед деплоем  

## Проверка после деплоя

После каждого деплоя проверьте:

1. **Товары отображаются на сайте:**
   - Откройте `/catalog`
   - Проверьте, что товары видны

2. **Админ-панель работает:**
   - Откройте `/admin/products`
   - Проверьте, что товары загружаются

3. **Файл существует:**
   ```bash
   ls -lh data/products.json
   # Должен показать размер файла (не 0 байт)
   ```

## Если товары все-таки удалились

Если после деплоя товары пропали:

1. **Проверьте резервные копии:**
   ```bash
   ls -la data/products.json.backup.*
   ```

2. **Восстановите из резервной копии:**
   ```bash
   cp data/products.json.backup.YYYYMMDD_HHMMSS data/products.json
   pm2 restart worldcashbox
   ```

3. **Или восстановите из Git (если файл был в репозитории):**
   ```bash
   git checkout HEAD -- data/products.json
   ```

## Рекомендации

1. **Добавьте `data/products.json` в Git:**
   - Это самый безопасный способ
   - Файл будет версионироваться
   - Можно откатить изменения

2. **Настройте автоматическое резервное копирование:**
   - См. `DEPLOY.md` раздел "Настройка резервного копирования"

3. **Используйте Git для деплоя:**
   - Это самый надежный способ
   - Все изменения отслеживаются
   - Легко откатить
