module.exports = {
  apps: [
    {
      name: 'travelaz',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      watch: false,
    },
  ],
};