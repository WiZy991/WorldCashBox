# Настройка таймаута Nginx для импорта товаров

Если при импорте товаров возникает ошибка 504 (Gateway Timeout) через ~60 секунд, это означает, что Nginx имеет таймаут по умолчанию 60 секунд.

## Решение

Добавьте следующие настройки в конфигурацию Nginx для вашего сайта:

```nginx
server {
    # ... другие настройки ...
    
    # Увеличиваем таймауты для API импорта
    location /api/sbis/products/import {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Увеличиваем таймауты до 30 минут (1800 секунд)
        proxy_connect_timeout 1800s;
        proxy_send_timeout 1800s;
        proxy_read_timeout 1800s;
        send_timeout 1800s;
    }
    
    # Или для всех API запросов:
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 1800s;
        proxy_send_timeout 1800s;
        proxy_read_timeout 1800s;
        send_timeout 1800s;
    }
}
```

## Применение изменений

После изменения конфигурации Nginx:

```bash
# Проверить конфигурацию
sudo nginx -t

# Перезагрузить Nginx
sudo systemctl reload nginx
# или
sudo service nginx reload
```

## Альтернативное решение

Если настройка Nginx недоступна, можно разбить импорт на несколько запросов или использовать фоновую задачу.
