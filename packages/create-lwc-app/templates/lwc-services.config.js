// Find the full example of all available configuration options at
// https://github.com/muenzpraeger/create-lwc-app/blob/main/packages/lwc-services/example/lwc-services.config.js
module.exports = {
    resources: [{ from: 'src<% if (clientserver) { %>/client<% } %>/resources/<% if (bundler === 'rollup') { %>**<% } %>', to: 'dist/resources/' }
        <% if ((appType === 'pwa' || bundler==='rollup') && !clientserver) { %>
            , { from: 'src/index.html', to: 'dist/'}, { from: 'src/manifest.json', to: 'dist/'}
        <% } %>
        <% if (((appType === 'pwa' && bundler==='rollup') || bundler === 'rollup') && clientserver) { %>
            , { from: 'src/client/index.html', to: 'dist/'}
        <% } %>
        <% if (appType === 'pwa' && bundler!=='rollup' && clientserver) { %>
            , { from: 'src/client/index.html', to: 'dist/index.html'}
        <% } %>
        <% if (appType === 'pwa' && clientserver) { %>
            , { from: 'src/client/manifest.json', to: 'dist/manifest.json'}
        <% } %>
            ],
        <% if (clientserver) { %>
            sourceDir: './src/client',
        <% } %>
        <% if (clientserver && bundler==='webpack') {%>
            devServer: {
                proxy: { '/': 'http://localhost:3002' }
            }
        <% } %>
};
