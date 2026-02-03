# Перезапуск PM2 с обновлением переменных окружения

## Проблема

При обычном `pm2 restart` переменные окружения из `ecosystem.config.js` не обновляются. PM2 показывает предупреждение:
```
Use --update-env to update environment variables
```

## Решение

### Вариант 1: Перезапуск с обновлением переменных окружения (рекомендуется)

```bash
pm2 restart worldcashbox --update-env
```

Или для всех приложений:
```bash
pm2 restart all --update-env
```

### Вариант 2: Полная перезагрузка конфигурации

```bash
# Остановить приложение
pm2 stop worldcashbox

# Удалить из PM2
pm2 delete worldcashbox

# Загрузить заново с обновленной конфигурацией
pm2 start ecosystem.config.js
```

### Вариант 3: Перезапуск через ecosystem.config.js

```bash
pm2 restart ecosystem.config.js --update-env
```

## Проверка переменных окружения

После перезапуска проверьте, что переменные загружены:

```bash
# Показать переменные окружения для процесса
pm2 env 0

# Или показать информацию о процессе
pm2 show worldcashbox
```

## Проверка логов

Если что-то не работает, проверьте логи:

```bash
# Последние логи
pm2 logs worldcashbox

# Логи с очисткой экрана
pm2 logs worldcashbox --lines 50
```

## Важно

- **Всегда используйте `--update-env`** при изменении переменных окружения в `ecosystem.config.js`
- После изменения `ecosystem.config.js` на сервере обязательно перезапустите с `--update-env`
- Убедитесь, что файл `ecosystem.config.js` на сервере содержит все нужные переменные
