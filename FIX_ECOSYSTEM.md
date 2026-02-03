# Исправление ошибки в ecosystem.config.js

## Проблема
Ошибка синтаксиса на строке 18: `Unexpected identifier 'SBIS_SECRET_KEY'`

## Решение на сервере

### Вариант 1: Перезаписать файл полностью

Выполните на сервере:

```bash
# 1. Создайте резервную копию
cp ecosystem.config.js ecosystem.config.js.backup

# 2. Создайте правильный файл
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'worldcashbox',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: process.cwd(),
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      // Переменные для интеграции с СБИС
      SBIS_SERVICE_KEY: 'JT1lnlaqTJ9ImP7Lhu6SnrDJFO7gQk5mO0tv83wsok4nbzS9ri4VbbvCKVeQIHDoMkwGnSCjMAF04M8pIL5tcH4BzaPsLiNuCijBx8Hp44w13YBWo7I6ID',
      SBIS_POINT_ID: '206',
      SBIS_PRICE_LIST_ID: '15',
      SBIS_WAREHOUSE_ID: '284a42ba-97cc-4d9c-98af-00000000100a',
      SBIS_WAREHOUSE_NAME: 'Склад32'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.next']
  }]
}
EOF

# 3. Проверьте синтаксис
node -c ecosystem.config.js

# 4. Если ошибок нет, перезапустите PM2
pm2 restart ecosystem.config.js --update-env

# 5. Проверьте переменные
pm2 env 0 | grep SBIS
```

### Вариант 2: Редактировать вручную

```bash
# 1. Откройте файл
nano ecosystem.config.js

# 2. Убедитесь, что файл выглядит так (без SBIS_SECRET_KEY, если он не нужен):
module.exports = {
  apps: [{
    name: 'worldcashbox',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: process.cwd(),
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      SBIS_SERVICE_KEY: 'JT1lnlaqTJ9ImP7Lhu6SnrDJFO7gQk5mO0tv83wsok4nbzS9ri4VbbvCKVeQIHDoMkwGnSCjMAF04M8pIL5tcH4BzaPsLiNuCijBx8Hp44w13YBWo7I6ID',
      SBIS_POINT_ID: '206',
      SBIS_PRICE_LIST_ID: '15',
      SBIS_WAREHOUSE_ID: '284a42ba-97cc-4d9c-98af-00000000100a',
      SBIS_WAREHOUSE_NAME: 'Склад32'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.next']
  }]
}

# 3. Сохраните (Ctrl+O, Enter, Ctrl+X)

# 4. Проверьте синтаксис
node -c ecosystem.config.js

# 5. Перезапустите PM2
pm2 restart ecosystem.config.js --update-env
```

## Важно

- Убедитесь, что после каждого свойства в объекте `env` стоит запятая (кроме последнего)
- Убедитесь, что все строковые значения в кавычках
- Если `SBIS_SECRET_KEY` не используется в коде, удалите эту строку
