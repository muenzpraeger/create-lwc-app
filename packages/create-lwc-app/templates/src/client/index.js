import { buildCustomElementConstructor } from 'lwc';
import MyApp from 'my/app';
<% if (appType === 'pwa') { %>
const availableFeature = detectFeatures();
const isCompatibleBrowser = Object.keys(availableFeature).some(
    feature => !availableFeature[feature]
);

if (isCompatibleBrowser) {
    unsupportedErrorMessage(availableFeature);
} else {
    init();
}

function detectFeatures() {
    return {
         'Service Worker': 'serviceWorker' in navigator
    };
}

function unsupportedErrorMessage(availableFeature) {
    const { outdated } = window;
    outdated.style.display = 'unset';

    let message = `This browser doesn't support all the required features`;

    message += `<ul>`;
    for (const [name, available] of Object.entries(availableFeature)) {
        message += `<li><b>${name}:<b> ${available ? '✅' : '❌'}</li>`;
    }
    message += `</ul>`;

    outdated.querySelector('.unsupported_message').innerHTML = message;
}

function init() {
    customElements.define('my-app', buildCustomElementConstructor(MyApp));
}<% } else { %>
customElements.define('my-app', buildCustomElementConstructor(MyApp));
<% } %>
