const PROXY_CONFIG = [
  {
    target: "http://localhost",
    secure: false,
    changeOrigin: true,
    logLevel: "debug"
  }
];

module.exports = PROXY_CONFIG;
