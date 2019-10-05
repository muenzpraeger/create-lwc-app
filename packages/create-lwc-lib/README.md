# create-lwc-lib

Creating Lightning Web Components libraries is a breeze.

Check out the documentation for using `create-lwc-lib` [here](https://github.com/muenzpraeger/create-lwc-app).

## Introduction

This command line tool creates a project hosting reusable LWC components. The components can be published to
an NPM server and reused by other projects.

## Building the project

### Building the project

The project features some scripts to build components. Note that the example uses `yarn` as the package manager
but `npm` can also be used.
  
  - `yarn build`  
    Builds the project for development (the code is not minified)
  - `yarn build:production`  
    Builds the project for production

Each build commands builds both a regular version of the components, targetting modern browsers, as well as
a 'compatibility' version targetting older browsers. The file `scripts/rollup.config.js` can be modified
to remove the compatibility build if it is not needed.

By default, the components are packaged in a `iife` file that is ready to be used.


### Running the components

A instance of node 'express' server can be started to test a component

  - `yarn serve`  
    Starts a local development server with the built files.
  - `yarn start`  
    Starts a local development server, a background build tasks and watches the changes.

The test server exports two URLs, one showing the component created by the factory function and the other
as a custom element:

  - http://localhost:3000
  - http://localhost:3000/wc

For both pages, an optional `?compat[=true|false]` paraneter can be used to force or not the comnpatibility
mode.


## Project structure

The source code for the component is located within the root  `src/` folder, where each component is hosted 
in its own folder as `[package name]/[component-name]`.  

A root `main.js` is also added to the `src/` folder. It references the components that needs to be exported 
for reuse. The components can be registered as either true custom elements, or through a factory function.
