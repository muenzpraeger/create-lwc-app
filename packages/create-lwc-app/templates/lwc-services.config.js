// Find the full example of all available configuration options at
// https://github.com/muenzpraeger/create-lwc-app/blob/master/packages/lwc-services/example/lwc-services.config.js
module.exports = {
    resources: [{ from: 'src<% if (clientserver) { %>/client<% } %>/resources', to: 'dist/resources/' }<% if ((appType === 'pwa' || bundler==='rollup') && !clientserver) { %>, { from: 'src/index.html', to: 'dist/'}, { from: 'src/manifest.json', to: 'dist/'}<% } %><% if (appType === 'pwa' && clientserver) { %>, { from: 'src/client/index.html', to: 'dist/index.html'}, { from: 'src/client/manifest.json', to: 'dist/manifest.json'}<% } %>],<% if (clientserver) { %>
    sourceDir: './src/client',
    moduleDir: './src/client/modules',<% } %>
    <% if (clientserver && bundler==='webpack') {%>devServer: {
        proxy: { '/': 'http://localhost:3002' }
    }<% } %>
};
