// -- Libs -----------------------------------------------------------------------------
const fs = require('fs');
const path = require('path');
const express = require('express');
const useragent = require('useragent');

// -- Config ----------------------------------------------------------------------------
const template  = fs.readFileSync(path.join(__dirname, 'public/template.html'), 'utf8');
const log = process.stdout.write.bind(process.stdout);
const port = process.env.PORT || 3000;
const app = express();

// -- Helpers ---------------------------------------------------------------------------
function isCompat(userAgent) {
    const { family, major } = useragent.parse(userAgent);
    const majorVersion = parseInt(major, 10);
    return family === 'IE'
        || (family === 'Chrome'  && majorVersion < 48)
        || (family === 'Firefox' && majorVersion < 52)
        || (family === 'Safari'  && majorVersion < 10);
}

function staticPath(...args) {
    return path.join(__dirname, 'public', ...args);
}

function renderTemplate(isCompat) {
    // Poor's man templating engine
    return template
        .replace('{{js_bundle}}', isCompat ? 'compat' : 'main');
}

// -- Middlewares -----------------------------------------------------------------------
app.use('/static', express.static(staticPath()));
app.get('/', (req, res) => {
    const isCompatMode = isCompat(req.headers['user-agent']);
    res.send(renderTemplate(isCompatMode));
});

// -- Server Start -----------------------------------------------------------------------
module.exports.start = () => {
    return new Promise((resolve) => {
        const server = app.listen(port, () => {
            log(`Server ready - http://localhost:${port}\n`);
            resolve(server);
        });
    });
};
