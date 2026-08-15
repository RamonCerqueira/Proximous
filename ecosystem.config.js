module.exports = {
  apps: [
    {
      name: 'proximous-backend',
      script: 'src/main.py',
      interpreter: './venv/bin/python3',
      cwd: './proximous_backend',
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
      script: 'npx',
      args: 'serve -s dist -l 8701',
      cwd: './proximous-web',
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
