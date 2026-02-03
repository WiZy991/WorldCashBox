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
      SBIS_WAREHOUSE_NAME: 'Толстого 32А', // Название склада для поиска
      // Реквизиты организации (необходимы для поиска склада по названию)
      SBIS_ORG_INN: '4804948184', // ИНН компании
      SBIS_ORG_KPP: '480494818' // КПП компании
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

