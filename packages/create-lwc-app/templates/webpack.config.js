// Custom webpack configuration file, provides generation of service worker
// More information: https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
    plugins: [new GenerateSW({ swDest: 'sw.js' })]
};
