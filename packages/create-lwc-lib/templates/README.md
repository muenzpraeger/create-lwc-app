# LWC TodoMVC

This [TodoMVC app](http://todomvc.com/) works as a proof of concept and boilerplate for standalone applications based on Lightning Web Components (LWC).

## Supported Browsers

These browsers take full advantage of Lightning Web Components performance enhancements:

| Browser Name | Version |
 --- | --- |
| Google Chrome™ | 59 |
| Microsoft® Edge | 15 |
| Mozilla® Firefox® | 54 |
| Apple® Safari® | 11 |

For earlier versions of these browsers, and for other browsers, the framework uses compatibility mode. Compatibility mode uses the lowest common denominator—the framework transpiles down to ES5 and adds the required polyfills. Not all modern Web APIs are available by default.

Running in compatibility mode affects performance. For example, Lightning Web Components work correctly in Safari 9 and Microsoft® Internet Explorer® 11, but they miss framework optimizations, don’t perform as well, and not all modern Web APIs are available.

## Installation

### 1) Download the repository

In order to clone the repo, you need to make sure that you can [connect to Github with SSH](https://help.github.com/enterprise/2.8/user/articles/connecting-to-github-with-ssh/).

```bash
git clone git@github.com/salesforce/lwc-todomvc.git
cd lwc-todomvc
```

### 2) Install dependencies

```bash
yarn install
```

### 3) Build the project

```bash
yarn build
```

By default the command will generate the application in **development** mode. You can change the default behavior with the `NODE_ENV` environment variable.

```bash
NODE_ENV=production yarn build
```

This build step produces the two files `public/js/main.js` and `public/js/compat.js`. `public/js/compat.js` should be used for IE11 and browser versions older than the ones listed above.

### 4) Build & run in dev mode

For your development convenience, you can build the file bundles into /dist and launch a Node server + browser by running:

```bash
yarn start
```

### 5) Running the app in different modes

The application server implements a UA detection mechanism used to serve different files to accommodate for different browser capabilities.

LWC `compat` mode will deliver a set of polyfills to guarantee that your application can run on browsers where Web Components APIs
are not available. Accessing the following URL will result in the server sending all the required files based on the user agent.

```bash
http://localhost:3000/
```

### 6) Run test

```bash
yarn test:unit          # Run jest unit tests
yarn test:integration   # Run webdriver integration test
```

Running the webdriver test requires a [selenium](http://www.seleniumhq.org/) server running locally over the port `4444`.

If you don't want to run the webdriver test locally, you will need to run it on [Sauce Labs](https://saucelabs.com). You will need to set the following environment variable to run test over Sauce Labs: `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY`.

```bash
SAUCE_USERNAME=[my-username] SAUCE_ACCESS_KEY=[my-access-token] yarn run test:integration
```

## Configurations

Configuring your editor to use our lint and code style rules will help make the
code review process delightful!

### types

LWC relies on type annotations heavily.

* Make sure your editor supports [typescript](https://www.typescriptlang.org/).
* Additionally, you can use [flow](https://flowtype.org/).

### eslint

[Configure your editor][eslint-integrations] to use our eslint configurations.

### editorconfig

[Configure your editor][editorconfig-plugins] to use our editor configurations.

If you are using Visual Studio Code then use this:

```
ext install EditorConfig
```

### Lint

```bash
yarn lint
```

The recommended way to lint this project is to [configure your
editor][eslint-integrations] to warn you in real-time as you edit the file.

[eslint-integrations]: http://eslint.org/docs/user-guide/integrations
[editorconfig-plugins]: http://editorconfig.org/#download
