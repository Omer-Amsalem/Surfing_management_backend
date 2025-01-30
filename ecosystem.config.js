module.exports = {
  apps : [{
    name   : "REST API",
    script : "./dist/src/app.js",
    env_production: {
      NODE_ENV: "production",
    }
  }]
}
