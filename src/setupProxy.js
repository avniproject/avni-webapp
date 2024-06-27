// https://www.npmjs.com/package/http-proxy-middleware
const _ = require("lodash");
const moment = require("moment");
const { createProxyMiddleware } = require("http-proxy-middleware");
const filteredPathStarts = ["/static", "/manifest.", "/favicon.ico", "/__get-internal-source", "/main."];
const filter = function(pathname, req) {
  const doFilter = !(pathname === "/" || _.some(filteredPathStarts, x => _.startsWith(pathname, x)));
  console.log("Send request to server", pathname, req.url, doFilter);
  return doFilter;
};

module.exports = function(app) {
  console.log("Setting up proxy");
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

  const requestHandler = createProxyMiddleware(filter, {
    target: process.env.BACKEND_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      console.log("[", moment().format("h:mm:ss:SSS"), "] onProxyReq", proxyReq.host, proxyReq.path);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log("[", moment().format("h:mm:ss:SSS"), "] onProxyRes", req.url, proxyRes.statusCode);
    }
  });
  app.use("/", requestHandler);
};
