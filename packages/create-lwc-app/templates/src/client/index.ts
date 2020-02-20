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
    customElements.define('my-app', buildCustomElementConstructor(MyApp));

    if ('serviceWorker' in navigator) {
        // Register service worker after page load event to avoid delaying critical requests for the
        // initial page load.
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js');
            console.log('Service worker registered');
        });
    }
}

function detectFeatures() {
    return {
         'Service Worker': 'serviceWorker' in navigator
    };
}

function unsupportedErrorMessage() {
    const { outdated } = window;
    outdated.style.display = 'unset';

    let message = `This browser doesn't support all the required features`;

    message += `<ul>`;
    for (const [name, available] of Object.entries(availableFeature)) {
        message += `<li><b>${name}:<b> ${available ? '✅' : '❌'}</li>`;
    }
    message += `</ul>`;

    // eslint-disable-next-line @lwc/lwc/no-inner-html
    outdated.querySelector('.unsupported_message').innerHTML = message;
}

<% } else { %>
customElements.define('my-app', buildCustomElementConstructor(MyApp));
<% } %>
