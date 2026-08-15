module.exports = {
  apps: [
    {
      name: 'proximous-backend',
      script: 'src/main.py',
      interpreter: '/var/www/proximous/proximous_backend/venv/bin/python3',
      cwd: '/var/www/proximous/proximous_backend',
      env: {
        NODE_ENV: 'production',
        PORT: 8700,
        HOST: '0.0.0.0',
        FLASK_DEBUG: 'False'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'proximous-web',
      script: 'node_modules/serve/build/main.js',
      args: '-s dist -l 8701',
      cwd: '/var/www/proximous/proximous-web',
      env: {
        NODE_ENV: 'production',
        PORT: 8701
      },
      instances: 1,
      autorestart: true,
      watch: false
    }
  ]
};
