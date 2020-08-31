# rollup-plugin-lwc-typescript

Simple Rollup plugin to transform TypeScript files to JavaScript for Lightning Web Components.

Make sure to add it before the LWC rollup plugin.

```javascript
import lwcTypescriptPlugin from 'rollup-plugin-lwc-typescript';
import lwcRollUpPlugin from "@lwc/rollup-plugin";
...

function rollupConfig() {
    return {
        input: path.resolve(__dirname, "components.js"),
        output: {
            file: path.join(__dirname, "build", "app.js"),
            format: "esm"
        },
        plugins: [
            lwcTypescriptPlugin(),
            lwcRollupPlugin({
                modules: "src/modules",
                stylesheetConfig: {
                    customProperties: { allowDefinition: true }
                }
            })
        ]
}

```

Read more about Lightning Web Components [here](https://github.com/muenzpraeger/create-lwc-app).

## Live App

If you want to see Lightning Web Components in action - check out [https://recipes.lwc.dev](https://recipes.lwc.dev).
