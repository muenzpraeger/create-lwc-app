# lwc-create-app

A tool for setting up your Lightning Web Components projects.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/lwc-create-app.svg)](https://npmjs.org/package/lwc-create-app)
[![Downloads/week](https://img.shields.io/npm/dw/lwc-create-app.svg)](https://npmjs.org/package/lwc-create-app)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

## Quick Start

To get up and running execute the following command in a shell/terminal:

```
npx lwc-create-app your-app-name
```

> To run this, you must have Node.js installed, with at least npm 5.2+. You should be familiar with either npm or yarn. The npx tool is a package runner that installs with npm 5.2+.

This will run a npx installation of [lwc-create-app](./packages/lwc-create-app), guide you with a couple of steps through the setup, and then create a new Lightning Web Components project for you.

Then run `yarn watch` (or `npm run watch`, depending on your personal preference and what you've chosen during the npx installation). **Done!**

## So what's this tool about?

Technically it's a toolchain that gives you a quickstart experience for developing with Lightning web components. This project consists out of two packages:

-   [lwc-create-app](./packages/lwc-create-app)
-   [lwc-services](./packages/lwc-services)

It is focused on providing a quick, but also if needed customizable, onboarding experience when you want to develop with Lightning Web Components. If you want to develop Lightning Web Components on the Salesforce Platform you may want to look into using [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli) instead.

If you haven't heard about Lightning Web Components - it's a new framework, introduced by [Salesforce](https://www.salesforce.com/), based on the Web Components specifications. Read more about it in the [official documentation](https://lwc.dev).

## lwc-services

Using `lwc-create-app` is meant to be a one-stop-shop solution. The created project contains everything you need to get started. It adds one dependecy, which is `lwc-services`. Find below a list of all the things that are bundled with it. When you create a project with `lwc-create-app` also a number of predefined scripts gets added to your `package.json`.

### Configuration

If you want to override certain behavior of `lwc-services` you can place a `lwc-services.config.js` file into the root of your app directory. Checkout [the example file](./packages/lwc-services/example/lwc-services.config.js) for possible configuration parameters and values.

### Commands

<!-- commands -->

-   [`lwc-services build`](#lwc-services-build)
-   [`lwc-services serve`](#lwc-services-serve)
-   [`lwc-services sniff`](#lwc-services-sniff)
-   [`lwc-services test`](#lwc-services-test)
-   [`lwc-services watch`](#lwc-services-watch)

#### `lwc-services build`

Creates a new webpack build

```
USAGE
  $ lwc-services build

OPTIONS
  -d, --destination=destination  [default: ./dist] defines the directory where the build is stored
  -m, --mode=mode                [default: development] defines the mode for the build (production|development)
  -n, --noclear                  setting this will not re-create the build dir
  -w, --webpack=webpack          location of custom webpack configuration file

EXAMPLES
  lwc-services build
  lwc-services build -d ./public --noclear
```

#### `lwc-services serve`

Runs a Lightning Web Components project with a local Express server (likely not to use for production if you know what I mean ;-))

```
USAGE
  $ lwc-services serve

OPTIONS
  -d, --directory=directory  [default: ./dist] defines the directory where the build is stored
  -i, --host=host            [default: localhost] sets the hostname
  -o, --open                 opens the site in the default browser
  -p, --port=port            [default: 3002] configures the port of the application
  -w, --webpack=webpack      location of custom webpack configuration file

EXAMPLES
  lwc-services serve
  lwc-services serve -p 3998 -h 192.168.178.12 -m production
```

#### `lwc-services sniff`

Exports configuration information. It's not a full "eject" out of this tool. Yet.

```
USAGE
  $ lwc-services sniff

OPTIONS
  -d, --directory=directory  (required) exports configuration files to the given directory
  -w, --webpack=webpack      location of custom webpack configuration file

EXAMPLE
  lwc-services sniff -d somedirectory
```

#### `lwc-services test`

Runs Jest tests for Lightning Web Components

```
USAGE
  $ lwc-services test

OPTIONS
  -c, --coverage  collects a coverage report
  -d, --debug     runs tests in debug mode (https://jestjs.io/docs/en/troubleshooting)
  -w, --watch     runs in watch mode and re-runs tests on file changes
  -r, --runInBand runs tests serially (slower, but often needed when running on CI systems)

EXAMPLES
  lwc-services test
  lwc-services test --coverage
  lwc-services test -w
```

#### `lwc-services watch`

Runs a Lightning Web Components project in watch mode

```
USAGE
  $ lwc-services watch

OPTIONS
  -i, --host=host        [default: localhost] sets the hostname
  -m, --mode=mode        [default: development] defines the mode for the build (production|development)
  -o, --open             opens the site in the default browser
  -p, --port=port        [default: 3001] configures the port of the application
  -w, --webpack=webpack  location of custom webpack configuration file

EXAMPLES
  lwc-services serve
  lwc-services serve -p 3998 -h 192.168.178.12 -m production
```

<!-- commandsstop -->

## Contribution

If you have great ideas on how to extend this tool - feel free to open new issues, and then PR something in. ;-)

Please read [the contribution guideline](./CONTRIBUTION.md) for that. Thanks!
