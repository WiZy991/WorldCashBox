# Решение конфликта при git pull на сервере

## Проблема
При выполнении `git pull` возникает ошибка:
```
error: Your local changes to the following files would be overwritten by merge:
        ecosystem.config.js
```

Это происходит потому, что на сервере были изменены переменные окружения в `ecosystem.config.js`, но эти изменения не закоммичены.

## Решение

### Вариант 1: Сохранить изменения и применить после pull (рекомендуется)

```bash
# 1. Сохраните текущие переменные окружения
grep -A 10 "env: {" ecosystem.config.js > /tmp/ecosystem_env_backup.txt

# 2. Откатите изменения в ecosystem.config.js
git checkout ecosystem.config.js

# 3. Сделайте pull
git pull

# 4. Восстановите переменные окружения вручную
# Откройте файл и добавьте переменные СБИС обратно в секцию env
nano ecosystem.config.js
```

Или автоматически:

```bash
# 1. Сохраните секцию env
cat ecosystem.config.js | grep -A 10 "env: {" > /tmp/env_section.txt

# 2. Откатите файл
git checkout ecosystem.config.js

# 3. Pull
git pull

# 4. Восстановите переменные (если они не были в репозитории)
# Проверьте, есть ли переменные в обновленном файле
grep SBIS_SERVICE_KEY ecosystem.config.js

# Если нет, добавьте их вручную или используйте sed
```

### Вариант 2: Stash (временное сохранение)

```bash
# 1. Сохраните изменения во временное хранилище
git stash

# 2. Сделайте pull
git pull

# 3. Примените сохраненные изменения обратно
git stash pop

# 4. Если возникнут конфликты, разрешите их вручную
nano ecosystem.config.js
```

### Вариант 3: Закоммитить изменения на сервере (не рекомендуется)

```bash
# 1. Добавьте файл
git add ecosystem.config.js

# 2. Закоммитьте
git commit -m "Add SBIS environment variables"

# 3. Pull (может потребоваться merge)
git pull

# 4. Если нужно, отправьте изменения обратно
git push
```

## После восстановления переменных

После того как переменные окружения будут восстановлены:

```bash
# Перезапустите PM2 с обновленными переменными
pm2 restart ecosystem.config.js --update-env

# Проверьте переменные
pm2 env 0 | grep SBIS

# Сохраните конфигурацию PM2
pm2 save
```

## Рекомендация

Лучше всего добавить переменные окружения СБИС в репозиторий в файле `ecosystem.config.js`, чтобы они автоматически применялись при каждом деплое. Но убедитесь, что файл не содержит секретных данных в открытом виде (или используйте `.env.production`).
