## Changelog

### 2019-06-12

**lwc-services 1.2.2**

-   Added the `--passthrough` flag for the `test` command to allow any Jest CLI flag (thanks to [@rcurry-sf](https://github.com/rcurry-sf) and [his contribution](https://github.com/muenzpraeger/lwc-create-app/pull/54))

### 2019-06-11

**lwc-create-app 1.2.1**

-   Fix an issue where `npx lwc-create-app your-app` fails on Linux systems (thanks to [@adamSellers](https://github.com/adamSellers) and [his contribution](https://github.com/muenzpraeger/lwc-create-app/pull/49))

### 2019-06-05

**lwc-create-app 1.2.0**

-   Automatically init Git repo after project initialization for pre-commit hooks
-   Adding default .eslintignore
-   Updating Husky dependency

**lwc-services 1.2.0**

-   Adding webpack default config for SPA (Single Page Application), see [issue #33](https://github.com/muenzpraeger/lwc-create-app/issues/33)
-   Allowing multiple entry points for custom webpack configuration files
-   Optimizing default chunking for webpack

### 2019-06-04

**lwc-create-app 1.1.1**

-   Limit pre-commit linting to JS files

### 2019-06-03

**lwc-create-app 1.1.0**

-   Added new option to create scaffolding for client/server structure using `Express`
-   Add Jest configuration file as default to project root

**lwc-services 1.1.0**

-   Using `Express` instead of `webpack-dev-server` for webpack bundle serving
-   Added custom server configuration option for `Express`
-   Switched `build` script to production mode, and added a new `build:development` script

### 2019-06-01

**lwc-create-app 1.0.4**

-   Updating default README
-   Updating formatting of default `.prettierrc` file

**lwc-services 1.0.5**

-   Fixed `production` build for webpack
-   Added `runInBand` flag for `test` command to better support CI systems

**lwc-services 1.0.4**

### 2019-05-30

**lwc-create-app 1.0.2**

-   Updating min node version to >=10.0
-   Defaulting to register a custom element on app creation

**lwc-services 1.0.3**

-   Updating min node version to >=10.0

### 2019-05-29

-   Initial version
