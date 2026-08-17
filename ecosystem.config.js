module.exports = {
  apps: [
    {
      name: "supreme-backend",
      script: "/var/www/supreme-tech-backend/venv/bin/uvicorn",
      args: "app.main:app --host 0.0.0.0 --port 5001",
      cwd: "/var/www/supreme-tech-backend",
      interpreter: "none",
      watch: false,
      env: {
        PATH: "/var/www/supreme-tech-backend/venv/bin:" + process.env.PATH
      }
    },
    {
      name: "bale-bot",
      script: "/var/www/supreme-tech-backend/venv/bin/python",
      args: "-m app.bot.bot",
      cwd: "/var/www/supreme-tech-backend",
      interpreter: "none",
      watch: false,
      env: {
        PATH: "/var/www/supreme-tech-backend/venv/bin:" + process.env.PATH
      }
    }
  ]
};