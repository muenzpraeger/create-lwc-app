// Custom workbox configuration file, provides generation of service worker
// More information: https://developers.google.com/web/tools/workbox/modules/workbox-build
module.exports = {
    swDest: 'dist/sw.js',
    globDirectory: 'dist/',
    globPatterns: ['*.{html,js,json}', 'resources/**/*.png']
};
