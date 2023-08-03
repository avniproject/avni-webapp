// https://www.npmjs.com/package/http-proxy-middleware
const _ = require("lodash");
const { createProxyMiddleware } = require("http-proxy-middleware");
const filter = function(pathname, req) {
  const doFilter = !(
    pathname === "/" ||
    _.startsWith(pathname, "/static") ||
    _.startsWith(pathname, "/manifest.json")
  );
  return doFilter;
};

module.exports = function(app) {
  app.use(
    "/etl",
    createProxyMiddleware(
      () => {
        return true;
      },
      {
        target: "http://localhost:8022",
        changeOrigin: true,
        pathRewrite: { "^/etl": "" }
      }
    )
  );

  app.use(
    "/",
    createProxyMiddleware(filter, {
      target: process.env.BACKEND_URL,
      changeOrigin: true
    })
  );
};
