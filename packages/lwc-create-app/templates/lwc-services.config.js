// Find the full example of all available configuration options at
// https://github.com/muenzpraeger/lwc-create-app/blob/master/packages/lwc-services/example/lwc-services.config.js
module.exports = {
    resources: [{ from: 'src<% if (clientserver) { %>/client<% } %>/resources', to: 'dist/resources' }],<% if (clientserver) { %>
    sourceDir: './src/client',
    moduleDir: './src/client/modules',
    server: {
        customConfig: './src/server/index.js'
    }<% } %>
};
