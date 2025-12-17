# Инструкция по размещению сайта WorldCashBox на сервере Ubuntu

## Требования

- Сервер Ubuntu 20.04 или выше
- Доступ по SSH с правами sudo
- Доменное имя: **worldcashboxvl.ru**
- Настроенные DNS записи для домена (A-запись указывает на IP сервера)

## Шаг 0: Настройка DNS записей

Перед началом деплоя убедитесь, что DNS записи для домена настроены правильно:

### 0.1 Настройка A-записи

В панели управления вашего доменного регистратора добавьте следующие DNS записи:

```
Тип: A
Имя: @ (или worldcashboxvl.ru)
Значение: <IP-адрес-вашего-сервера>
TTL: 3600

Тип: A
Имя: www
Значение: <IP-адрес-вашего-сервера>
TTL: 3600
```

### 0.2 Проверка DNS записей

После настройки DNS подождите несколько минут и проверьте:

```bash
# Проверка A-записи для основного домена
dig worldcashboxvl.ru +short

# Проверка A-записи для www поддомена
dig www.worldcashboxvl.ru +short

# Оба должны возвращать IP-адрес вашего сервера
```

## Шаг 1: Подготовка сервера

### 1.1 Обновление системы

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Установка Node.js и npm

```bash
# Установка Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка версий
node --version
npm --version
```

### 1.3 Установка PM2 (менеджер процессов)

```bash
sudo npm install -g pm2
```

### 1.4 Установка Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Шаг 2: Подготовка проекта

### 2.1 Клонирование проекта на сервер

```bash
# Создаем директорию для проектов
sudo mkdir -p /var/www
cd /var/www

# Клонируем репозиторий (или загружаем файлы через scp/sftp)
# Если используете Git:
sudo git clone <ваш-репозиторий> worldcashbox
# Или загрузите файлы через scp с вашего локального компьютера:
# scp -r ./WorldCashBox user@worldcashboxvl.ru:/var/www/worldcashbox

# Устанавливаем владельца
sudo chown -R $USER:$USER /var/www/worldcashbox
cd /var/www/worldcashbox
```

### 2.2 Установка зависимостей

```bash
npm install
# или если используете yarn:
# yarn install
```

### 2.3 Создание production сборки

```bash
npm run build
```

## Шаг 3: Настройка переменных окружения

### 3.1 Создание файла .env.production

```bash
nano .env.production
```

Добавьте необходимые переменные окружения:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://worldcashboxvl.ru
# Добавьте другие необходимые переменные
```

### 3.2 Создание директорий для данных

```bash
# Создаем директории для данных приложения
mkdir -p data
mkdir -p public/images/products/banners
mkdir -p public/images/products/misc
mkdir -p public/images/products/equipment
mkdir -p public/images/products/consumables
mkdir -p public/images/products/software
mkdir -p public/images/products/video
mkdir -p public/images/products/pos
mkdir -p public/images/products/printers
mkdir -p public/images/products/terminals
mkdir -p public/images/products/cameras
mkdir -p public/images/products/smart
mkdir -p public/images/products/tsd

# Устанавливаем права доступа
chmod -R 755 data
chmod -R 755 public/images

# Убедитесь, что пользователь, под которым запускается приложение, имеет права на запись
# Если приложение запускается от имени другого пользователя, установите владельца:
# sudo chown -R $USER:$USER /var/www/worldcashbox/public/images
# sudo chown -R $USER:$USER /var/www/worldcashbox/data
```

## Шаг 4: Настройка PM2

### 4.1 Создание конфигурационного файла PM2

```bash
nano ecosystem.config.js
```

Добавьте следующее содержимое:

```javascript
module.exports = {
	apps: [
		{
			name: 'worldcashbox',
			script: 'node_modules/next/dist/bin/next',
			args: 'start',
			cwd: '/var/www/worldcashbox',
			instances: 1,
			exec_mode: 'fork',
			env: {
				NODE_ENV: 'production',
				PORT: 3000,
			},
			error_file: '/var/log/pm2/worldcashbox-error.log',
			out_file: '/var/log/pm2/worldcashbox-out.log',
			log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
			merge_logs: true,
			autorestart: true,
			max_memory_restart: '1G',
		},
	],
}
```

### 4.2 Запуск приложения через PM2

```bash
# Создаем директорию для логов
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Запускаем приложение
pm2 start ecosystem.config.js

# Сохраняем конфигурацию PM2 для автозапуска
pm2 save

# Настраиваем автозапуск PM2 при перезагрузке системы
pm2 startup
# Выполните команду, которую выведет PM2 (она будет содержать sudo)
```

## Шаг 5: Настройка Nginx как Reverse Proxy

### 5.1 Создание конфигурации Nginx

```bash
sudo nano /etc/nginx/sites-available/worldcashbox
```

Добавьте следующую конфигурацию:

```nginx
server {
    listen 80;
    server_name worldcashboxvl.ru www.worldcashboxvl.ru;

    # Лимиты для загрузки файлов
    client_max_body_size 20M;

    # Проксирование на Next.js приложение
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

        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Кеширование статических файлов
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    # Статические файлы из public (изображения)
    location /images {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1h;
        add_header Cache-Control "public";
        # Увеличиваем таймауты для больших файлов
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

### 5.2 Активация конфигурации

```bash
# Создаем символическую ссылку
sudo ln -s /etc/nginx/sites-available/worldcashbox /etc/nginx/sites-enabled/

# Удаляем дефолтную конфигурацию (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверяем конфигурацию Nginx
sudo nginx -t

# Перезапускаем Nginx
sudo systemctl restart nginx
```

## Шаг 6: Настройка SSL (Let's Encrypt)

### 6.1 Установка Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 6.2 Получение SSL сертификата

```bash
sudo certbot --nginx -d worldcashboxvl.ru -d www.worldcashboxvl.ru
```

Certbot автоматически настроит Nginx для использования HTTPS.

### 6.3 Автоматическое обновление сертификата

```bash
# Проверка автоматического обновления
sudo certbot renew --dry-run
```

## Шаг 7: Настройка файрвола

### 7.1 Настройка UFW

```bash
# Разрешаем SSH
sudo ufw allow OpenSSH

# Разрешаем HTTP и HTTPS
sudo ufw allow 'Nginx Full'

# Включаем файрвол
sudo ufw enable

# Проверяем статус
sudo ufw status
```

## Шаг 8: Полезные команды для управления

### 8.1 Управление приложением через PM2

```bash
# Просмотр статуса
pm2 status

# Просмотр логов
pm2 logs worldcashbox

# Перезапуск приложения
pm2 restart worldcashbox

# Остановка приложения
pm2 stop worldcashbox

# Удаление из PM2
pm2 delete worldcashbox

# Мониторинг
pm2 monit
```

### 8.2 Обновление приложения

```bash
cd /var/www/worldcashbox

# Если используете Git:
git pull origin main

# Устанавливаем зависимости (если изменились)
npm install

# Пересобираем приложение
npm run build

# Перезапускаем через PM2
pm2 restart worldcashbox
```

### 8.3 Управление Nginx

```bash
# Перезапуск
sudo systemctl restart nginx

# Проверка статуса
sudo systemctl status nginx

# Просмотр логов
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Шаг 9: Настройка резервного копирования

### 9.1 Создание скрипта резервного копирования

```bash
nano /var/www/backup.sh
```

Добавьте:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/worldcashbox"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Резервное копирование данных
tar -czf $BACKUP_DIR/data_$DATE.tar.gz /var/www/worldcashbox/data

# Резервное копирование конфигурации
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /var/www/worldcashbox/.env.production

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR -type f -mtime +7 -delete
```

```bash
chmod +x /var/www/backup.sh
```

### 9.2 Настройка автоматического резервного копирования

```bash
sudo crontab -e
```

Добавьте строку для ежедневного бэкапа в 2:00 ночи:

```
0 2 * * * /var/www/backup.sh
```

## Шаг 10: Мониторинг и оптимизация

### 10.1 Установка мониторинга (опционально)

```bash
# PM2 Plus (облачный мониторинг)
pm2 link <secret-key> <public-key>
```

### 10.2 Оптимизация производительности

- Убедитесь, что включен кеш Nginx
- Настройте сжатие gzip в Nginx
- Используйте CDN для статических файлов (опционально)

## Решение проблем

### Приложение не запускается

```bash
# Проверьте логи PM2
pm2 logs worldcashbox

# Проверьте, что порт 3000 свободен
sudo netstat -tulpn | grep 3000

# Проверьте переменные окружения
pm2 env 0
```

### Nginx возвращает 502 Bad Gateway

```bash
# Проверьте, что приложение запущено
pm2 status

# Проверьте логи Nginx
sudo tail -f /var/log/nginx/error.log

# Проверьте конфигурацию Nginx
sudo nginx -t
```

### Проблемы с правами доступа

```bash
# Установите правильные права для директорий
sudo chown -R $USER:$USER /var/www/worldcashbox
sudo chmod -R 755 /var/www/worldcashbox
```

## Дополнительные рекомендации

1. **Безопасность:**

   - Регулярно обновляйте систему: `sudo apt update && sudo apt upgrade`
   - Используйте сильные пароли
   - Настройте fail2ban для защиты от брутфорса
   - Регулярно проверяйте логи на подозрительную активность

2. **Производительность:**

   - Настройте кеширование в Next.js
   - Используйте CDN для статических ресурсов
   - Оптимизируйте изображения перед загрузкой

3. **Мониторинг:**
   - Настройте алерты для критических ошибок
   - Мониторьте использование ресурсов сервера
   - Регулярно проверяйте логи приложения

## Шаг 11: Проверка работоспособности

После завершения всех шагов проверьте:

1. **Доступность сайта:**

   ```bash
   # Проверка HTTP (должен редиректить на HTTPS)
   curl -I http://worldcashboxvl.ru

   # Проверка HTTPS
   curl -I https://worldcashboxvl.ru
   ```

2. **Откройте в браузере:**

   - https://worldcashboxvl.ru
   - https://www.worldcashboxvl.ru

   Оба адреса должны работать и автоматически редиректить на HTTPS.

3. **Проверка SSL сертификата:**

   - Откройте сайт в браузере
   - Нажмите на иконку замка в адресной строке
   - Убедитесь, что сертификат выдан Let's Encrypt и действителен

4. **Проверка загрузки изображений:**

   ```bash
   # Проверка существования директорий для изображений
   ls -la /var/www/worldcashbox/public/images/products/

   # Проверка прав доступа
   stat /var/www/worldcashbox/public/images/products/

   # Если нужно, установите права заново
   chmod -R 755 /var/www/worldcashbox/public/images
   chown -R $USER:$USER /var/www/worldcashbox/public/images
   ```

   - Откройте админ панель: `https://worldcashboxvl.ru/admin`
   - Попробуйте загрузить изображение для товара или акции
   - Проверьте логи PM2 на наличие ошибок: `pm2 logs worldcashbox --lines 50`

   **Если изображения не загружаются (ошибка 404):**

   - Проверьте логи PM2: `pm2 logs worldcashbox --lines 50`
   - Проверьте логи Nginx: `sudo tail -f /var/log/nginx/error.log`
   - Убедитесь, что файлы создаются: `ls -la /var/www/worldcashbox/public/images/products/misc/`
   - Проверьте права на запись: `touch /var/www/worldcashbox/public/images/products/misc/test.txt && rm /var/www/worldcashbox/public/images/products/misc/test.txt`
   - Перезапустите приложение: `pm2 restart worldcashbox && sudo systemctl restart nginx`

## Контакты и поддержка

При возникновении проблем проверьте:

- Логи PM2: `pm2 logs worldcashbox`
- Логи Nginx: `sudo tail -f /var/log/nginx/error.log`
- Статус сервисов: `sudo systemctl status nginx`, `pm2 status`
- DNS записи: `dig worldcashboxvl.ru +short`
- Доступность портов: `sudo netstat -tulpn | grep -E '80|443|3000'`

## Быстрая справка по командам

```bash
# Проверка статуса всех сервисов
pm2 status
sudo systemctl status nginx

# Просмотр логов
pm2 logs worldcashbox --lines 50
sudo tail -n 50 /var/log/nginx/error.log

# Перезапуск сервисов
pm2 restart worldcashbox
sudo systemctl restart nginx

# Проверка конфигурации Nginx
sudo nginx -t

# Проверка DNS
dig worldcashboxvl.ru +short
dig www.worldcashboxvl.ru +short
```
