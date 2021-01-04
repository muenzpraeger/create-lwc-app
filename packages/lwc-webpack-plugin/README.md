# lwc-webpack-plugin

This plugin allows to use LWC within every web framework project that uses Webpack.

```javascript
const LwcWebpackPlugin = require('lwc-webpack-plugin')

module.exports = {
    plugins: [new LwcWebpackPlugin()]
}
```

The above example assumes that you have configured LWC modules via `lwc.config.json` in your project root, or as `lwc` key in your package.json. You can read more about module configuration [in this blog](https://developer.salesforce.com/blogs/2020/09/lightning-web-components-module-resolution.html), or in [this RFC](https://rfcs.lwc.dev/rfcs/lwc/0020-module-resolution).

Pass the module configuration as parameter to the plugin, if you prefer to not use any of the above mentioned LWC module configuration options.

```javascript
const LwcWebpackPlugin = require('lwc-webpack-plugin')

module.exports = {
    plugins: [
        new LwcWebpackPlugin({
            modules: [
                { npm: 'lwc-recipes-oss-ui-components' },
                { npm: 'lightning-base-components' }
            ]
        })
    ]
}
```

The plugin takes also two additional configuration options:

-   `stylesheetConfig`
-   `outputConfig`

These options are 1:1 mappings of the LWC Compiler options, which are documented [here](https://github.com/salesforce/lwc/tree/master/packages/%40lwc/compiler#compiler-configuration-example).

Read more about Lightning Web Components [here](https://github.com/muenzpraeger/create-lwc-app).

## Live App

If you want to see Lightning Web Components in action - check out [https://recipes.lwc.dev](https://recipes.lwc.dev).
