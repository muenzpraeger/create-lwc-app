/**
 * NOTE: THIS IS FOR DIDACTIC PURPOSES ONLY
 * READ THE OFFICIAL DOCUMENTATION TO FULLY UNDERSTANDING ALL THIS CONCEPTS
 */

import Greeting from "my/greeting";
import { createElement, buildCustomElementConstructor } from "lwc";

// eslint-disable-next-line @lwc/lwc/no-document-query
const container = document.getElementById("main");

if (typeof customElements === 'undefined') {
    // Custom Element API is not available:
    // - creating the `App` element using LWC's proprietary API without a registry.
    // - another option here is to manually include a custom element polyfill (LWC doesn't provide one)
    const element = createElement("my-greeting", { is: Greeting });
    container.appendChild(element);
} else {
    // registering `App` as a custom element under the tagName `todo-app`
    customElements.define('my-greeting', buildCustomElementConstructor(Greeting));
    const element = document.createElement("my-greeting");
    container.appendChild(element);
}
