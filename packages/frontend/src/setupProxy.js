const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // app.use(
  //   createProxyMiddleware('/rpc', {
  //     ws: true,
  //     target: process.env.REACT_APP_RPC_ENDPOINT,
  //     changeOrigin: true,
  //     pathRewrite: {
  //       '^/rpc/': '/'
  //     }
  //   })
  // );
  // app.use(
  //   createProxyMiddleware('/rest', {
  //     target: process.env.REACT_APP_REST_ENDPOINT,
  //     changeOrigin: true,
  //     pathRewrite: {
  //       '^/rest/': '/'
  //     }
  //   })
  // );
};
