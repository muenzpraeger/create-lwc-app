## Changelog

### 2020-06-10

**create-lwc-app 2.1.0**

-   Add default `lwc.config.json` file for module resolution to project scaffolding (https://bit.ly/lwc-module-res)
-   Add new app type `electron` to provision a basic Electron project

**lwc-services 2.1.0**

-   Added automatic migration for old projects to new LWC module resolution in `build` command
-   Added support for Electron builds

### 2020-05-07

**create-lwc-app 2.0.7**

-   Fix creation of TypeScript project via silent installation

### 2020-04-27

**create-lwc-app 2.0.6**

-   Initial version of npm module resolution

### 2020-03-25

**create-lwc-app 2.0.2**

-   Fixed JS file creation in advanced setup mode
-   Dependency updates

**lwc-services 2.0.2**

-   Dependency updates

### 2020-03-04

**create-lwc-app 2.0.0**

-   Adding options when creating a new app: standard or PWA
-   Adding silent mode installation

**lwc-services 2.0.0**

-   Upgrading LWC to 1.3.x
-   Resorting dependencies
-   Change default host watch mode from `0.0.0.0` to `localhost`
-   Add support for Rollup builds
-   Add support for PWA builds
-   Removed `serve` functionality

### 2020-01-16

**create-lwc-app 1.3.13**

-   Updating message for Edge (non-Chromium)

### 2019-12-07

**lwc-services 1.3.12**

-   Adding passthrough parameters for Jest debug command
-   Fixed wrong path reference for Jest debug

### 2019-11-19

**lwc-services 1.3.9**

-   Adding support for node 12
-   Fixed error with not passing LWC compiler options
-   Added support for CSS only modules

### 2019-10-17

**lwc-services 1.3.7**

-   Fixed error for JavaScript projects on the `serve` command when using a custom Express config

### 2019-10-09

**create-lwc-app 1.3.5**

-   Correct template code in example (lint error)
-   Add support for Edge (special case handling without shadow DOM)

**lwc-services 1.3.5**

-   Upgrade to LWC 1.1.1
-   Fix for startup of bundled Express server with custom config

### 2019-10-09

**create-lwc-app 1.3.4**

-   Updated `.eslintrc.json` file for projects with Express

### 2019-10-07

**create-lwc-app 1.3.3**

-   New flag `--lib` to generate a library project

**lwc-services 1.3.3**

-   Support for 3rd party npm libraries that contain `lwc` modules

### 2019-10-02

**lwc-services 1.3.1**

-   Updated linting config for TypeScript
-   Update support for LWC npm modules (adjusting to LWC 1.1.x)

### 2019-09-29

**create-lwc-app 1.3.0**

-   RENAMED from `lwc-create-app` to `create-lwc-app`
-   Now supports creation of TypeScript-based projects

**lwc-services 1.3.0**

-   Updated to ^1.1.0 version of LWC
-   Support for TypeScript (yay!)
-   Express server recompiles automatically when project is in `watch` mode
-   Initial implementation for testing LWC with [WebDriverIO](https://www.npmjs.com/package/wdio-lwc-service)

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
