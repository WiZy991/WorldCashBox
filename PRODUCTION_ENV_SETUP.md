# Настройка переменных окружения для продакшена

## Проблема

Если вы видите ошибки "SBIS_SERVICE_KEY не настроен" или "SBIS_POINT_ID не настроен" на продакшен сервере (worldcashboxvl.ru), это означает, что переменные окружения не загружаются.

## Решение для продакшена

### Вариант 1: Файл .env.production (рекомендуется)

1. Создайте файл `.env.production` в корне проекта на сервере:

```env
SBIS_SERVICE_KEY=JT1lnlaqTJ9ImP7Lhu6SnrDJFO7gQk5mO0tv83wsok4nbzS9ri4VbbvCKVeQIHDoMkwGnSCjMAF04M8pIL5tcH4BzaPsLiNuCijBx8Hp44w13YBWo7I6ID
SBIS_POINT_ID=206
SBIS_PRICE_LIST_ID=15
SBIS_WAREHOUSE_ID=284a42ba-97cc-4d9c-98af-00000000100a
SBIS_WAREHOUSE_NAME=Склад32
```

2. Перезапустите приложение через PM2:
```bash
pm2 restart ecosystem.config.js
# или
pm2 restart all
```

### Вариант 2: Через PM2 ecosystem.config.js

Отредактируйте файл `ecosystem.config.js` и добавьте переменные окружения в секцию `env`:

```javascript
module.exports = {
  apps: [{
    name: 'worldcashbox',
    script: 'server.js',
    env: {
      SBIS_SERVICE_KEY: 'JT1lnlaqTJ9ImP7Lhu6SnrDJFO7gQk5mO0tv83wsok4nbzS9ri4VbbvCKVeQIHDoMkwGnSCjMAF04M8pIL5tcH4BzaPsLiNuCijBx8Hp44w13YBWo7I6ID',
      SBIS_POINT_ID: '206',
      SBIS_PRICE_LIST_ID: '15',
      SBIS_WAREHOUSE_ID: '284a42ba-97cc-4d9c-98af-00000000100a',
      SBIS_WAREHOUSE_NAME: 'Склад32',
      NODE_ENV: 'production'
    }
  }]
}
```

Затем перезапустите:
```bash
pm2 restart ecosystem.config.js
```

### Вариант 3: Системные переменные окружения

Установите переменные окружения на уровне системы (Linux):

```bash
# Добавьте в ~/.bashrc или ~/.profile
export SBIS_SERVICE_KEY="JT1lnlaqTJ9ImP7Lhu6SnrDJFO7gQk5mO0tv83wsok4nbzS9ri4VbbvCKVeQIHDoMkwGnSCjMAF04M8pIL5tcH4BzaPsLiNuCijBx8Hp44w13YBWo7I6ID"
export SBIS_POINT_ID="206"
export SBIS_PRICE_LIST_ID="15"
export SBIS_WAREHOUSE_ID="284a42ba-97cc-4d9c-98af-00000000100a"
export SBIS_WAREHOUSE_NAME="Склад32"

# Примените изменения
source ~/.bashrc

# Перезапустите PM2
pm2 restart all
```

## Проверка

После настройки переменных окружения проверьте:

1. Перезапустите приложение: `pm2 restart all`
2. Проверьте логи: `pm2 logs`
3. Попробуйте синхронизацию цен в админ-панели

## Важно

- **`.env.local`** работает только в режиме разработки (`npm run dev`)
- **`.env.production`** работает только в продакшене (`npm run build && npm start`)
- После изменения переменных окружения **обязательно перезапустите приложение**
