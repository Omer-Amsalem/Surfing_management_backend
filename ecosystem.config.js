module.exports = {
  apps : [{
    name   : "REST API",
    script : "./dist/src/server.js",
    env_production: {
      NODE_ENV: "production",
    }
  }]
}
