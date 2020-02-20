# v2 BETA Information

## create-lwc-app

The overall experience `create-lwc-app` has been streamlined by providing

-   a simple and an advanced mode
-   a silent (noprompt) setup
-   a new template for PWA support
-   Rollup support (if you don't like webpack)

### Standard vs. Advanced mode

When you run `create-lwc-app@beta your-app` the wizard will ask you if you want to run in simple mode (default).

In simple mode you mostly have to define name, app type (standard or PWA) etc..
When you go for the "advanced" mode you can select all the different options.

These are the default values that are automatically set when you run "simple" mode:

-   App type: standard app
-   Package manager: npm (if `yarn` is installed that will be auto-selected)
-   Bundler: Webpack
-   Language: JavaScript
-   Express API server: no

If you want else you've to go with the advanced mode.

### Silent mode

By using new CLI parameters you can skip the whole wizard experience.

-   `--silent` - mandatory flag for running the silent installation process
-   `-t | --t` - set the app type. Values are `standard` | `pwa`
-   `-o | --o` - set the options (if you want to override the defaults). Values are `rollup|yarn|express|typescript`

## lwc-services

The functionality of `lwc-services` hasn't changed. Although there are some breaking changes between v1 and v2. For new projects it's not relevant, for projects that you want to migrate you've to make some minor adjustments.

### No more `serve` command

The command `lwc-services serve` has been removed. The `serve` script in `package.json` still has that command, but just fires up a standard Express config in `node scripts/server.js`.

If you migrate from v1 to v2 you've to change the `serve` script accordingly.

### Switch your bundler

The commands `lwc-services build` and `lwc-services watch` have a new paramter `-b`. This allows you to set which bundler you want to use. The default is `webpack`. Depending on what bundler you select during the project setup via `create-lwc-app` the script commands in `package.json` will be set accordingly.

### Express server for local API development

In case you want to develop against a local Express server for simple API mocks etc. (if you selected that during the project setup) you'll find now a file `src/server/api.js` (or `ts` for TypesScript projects). That's also a full Express file (nothing "hidden"), so you have full control.

In case you used that before you have to migrate your configurations from the old `scripts/express-dev.js` file over. Note that also the file name changed from `server.js` to `api.js` (to make things move obvious).

### PWA support

Depending on your bundler selection you'll find in the `scripts/` folder either a custom `webpack.config.js` or a `workbock.generatesw.js`. These are the external files that allow you to control the PWA configuration based on workbox. Comments in the files point you to the documentation.

### Resource folders

In `lwc-services.config.js` you can configure which resources to copy over. In v2 the `to` parameter could be a file or directory. In v2 it must be a directory. For existing projects you've very likely to change `dist/resources` to `dist/`.

## What does not work yet?

Jest testing for TypeScript support. I switched back to the standard `@lwc/jest-*` packages, and have to PR a new fix for them.
