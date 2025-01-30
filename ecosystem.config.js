module.exports = {
  apps : [{
    name   : "REST API",
    script : "./dist/server.js",
    env_production: {
      NODE_ENV: "production",
    }
  }]
}
