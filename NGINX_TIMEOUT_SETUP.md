# Настройка таймаута Nginx для импорта товаров

Если при импорте товаров возникает ошибка 504 (Gateway Timeout) через ~60 секунд, это означает, что Nginx имеет таймаут по умолчанию 60 секунд.

## Решение

**ВАЖНО:** Блоки `location` должны быть в правильном порядке - более специфичные ПЕРЕД общими!

Добавьте следующие настройки в конфигурацию Nginx для вашего сайта (`/etc/nginx/sites-available/worldcashbox`):

```nginx
server {
    listen 80;
    server_name worldcashboxvl.ru www.worldcashboxvl.ru;
    
    client_max_body_size 20M;
    
    # ВАЖНО: Самый специфичный location ДОЛЖЕН быть ПЕРВЫМ!
    # Увеличиваем таймауты для API импорта товаров
    location /api/sbis/products/import {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Увеличиваем таймауты до 30 минут (1800 секунд)
        proxy_connect_timeout 1800s;
        proxy_send_timeout 1800s;
        proxy_read_timeout 1800s;
        send_timeout 1800s;
    }
    
    # Для всех остальных API запросов (менее специфичный, идет после)
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Стандартные таймауты для обычных API запросов
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Основной location (самый общий, идет последним)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Стандартные таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # ... остальные location блоки (/_next/static, /images и т.д.) ...
}
```

## Применение изменений

**КРИТИЧЕСКИ ВАЖНО:** После изменения конфигурации Nginx ОБЯЗАТЕЛЬНО перезагрузите его!

```bash
# 1. Откройте конфигурационный файл
sudo nano /etc/nginx/sites-available/worldcashbox

# 2. Добавьте блок location /api/sbis/products/import ПЕРЕД другими location блоками
# (скопируйте конфигурацию выше)

# 3. Проверить конфигурацию (должно быть "syntax is ok" и "test is successful")
sudo nginx -t

# 4. ОБЯЗАТЕЛЬНО перезагрузить Nginx (не просто проверить!)
sudo systemctl reload nginx
# или
sudo systemctl restart nginx

# 5. Проверить, что Nginx работает
sudo systemctl status nginx
```

**Если после перезагрузки все еще 504:**

1. Проверьте, что блок `location /api/sbis/products/import` находится ПЕРЕД `location /api/` и `location /`
2. Проверьте логи Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Проверьте, что Next.js приложение работает: `pm2 status`
4. Попробуйте прямой запрос к Next.js (минуя Nginx): `curl http://localhost:3000/api/sbis/products/import`

## Проверка текущей конфигурации

Если после настройки все еще получаете 504, проверьте:

```bash
# 1. Проверьте, что блок location /api/sbis/products/import существует и идет ПЕРВЫМ
sudo grep -A 15 "location /api/sbis/products/import" /etc/nginx/sites-available/worldcashbox

# 2. Проверьте порядок location блоков (должен быть: /api/sbis/products/import, затем /api/, затем /)
sudo grep -n "location /" /etc/nginx/sites-available/worldcashbox

# 3. Проверьте, что Nginx действительно перезагружен
sudo systemctl status nginx

# 4. Проверьте логи Nginx в реальном времени
sudo tail -f /var/log/nginx/error.log

# 5. Проверьте, что Next.js приложение работает
pm2 status
curl http://localhost:3000/api/sbis/products/import
```

## Диагностика проблемы

Если в логах видно `upstream timed out (110: Connection timed out)`, это означает:

1. **Nginx не может получить ответ от Next.js** - проверьте, что Next.js работает:
   ```bash
   pm2 logs worldcashbox --lines 50
   ```

2. **Блок location не применяется** - убедитесь, что он идет ПЕРЕД другими location блоками

3. **Nginx не перезагружен** - обязательно выполните:
   ```bash
   sudo systemctl restart nginx
   ```

## Альтернативное решение

Если настройка Nginx недоступна или не помогает, можно:
1. Разбить импорт на несколько запросов
2. Использовать фоновую задачу через очередь
3. Увеличить таймаут на уровне PM2 или Node.js
