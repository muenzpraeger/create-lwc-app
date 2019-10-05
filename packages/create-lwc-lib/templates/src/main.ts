/* eslint-disable no-constant-condition */
/* eslint-disable no-undef */

/**
 * NOTE: THIS IS FOR DIDACTIC PURPOSES ONLY
 * READ THE OFFICIAL DOCUMENTATION TO FULLY UNDERSTANDING ALL THIS CONCEPTS
 */

import { createElement, buildCustomElementConstructor } from "lwc";

// Components to export
import Greeting from "my/greeting";

// Register the components as custom elements
// This function can be removed if the components are not going to be used as custom elements
if(true) {
    if(typeof customElements !== 'undefined') {
        customElements.define('my-greeting', buildCustomElementConstructor(Greeting));
    }
}

// Register a function to create the components dynamically
// This function can be removed if the components are not going to be created that way
if(true) {
    const delegate = window.createLwcComponent;
    window.createLwcComponent = function createLwcComponent(name) {
        if(name==="my-greeting") return createElement("my-greeting", { is: Greeting });
        return delegate ? delegate(name) : null;
    }
}
