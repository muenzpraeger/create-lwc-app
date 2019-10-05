// -- Libs -----------------------------------------------------------------------------
const fs = require('fs');
const path = require('path');
const express = require('express');
const useragent = require('useragent');

// -- Config ----------------------------------------------------------------------------
const template  = fs.readFileSync(path.join(__dirname, 'public/template.html'), 'utf8');
const templateWc  = fs.readFileSync(path.join(__dirname, 'public/template-wc.html'), 'utf8');
const log = process.stdout.write.bind(process.stdout);
const port = process.env.PORT || 3000;
const app = express();

// -- Helpers ---------------------------------------------------------------------------
function isCompat(req) {
    if(req.query['compat'] || req.query['compat']==="") {
        return req.query['compat']!=="false";
    }
    const userAgent = req.headers['user-agent'];
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

function renderTemplate(template,isCompat) {
    // Poor's man templating engine
    return template
        .replace('{{js_bundle}}', isCompat ? 'compat' : 'main');
}

// -- Middlewares -----------------------------------------------------------------------
app.use('/static', express.static(staticPath()));
app.get('/', (req, res) => {
    const isCompatMode = isCompat(req);
    res.send(renderTemplate(template,isCompatMode));
});
app.get('/wc', (req, res) => {
    const isCompatMode = isCompat(req);
    res.send(renderTemplate(templateWc,isCompatMode));
});

// -- Server Start -----------------------------------------------------------------------
module.exports.start = () => {
    return new Promise((resolve) => {
        const server = app.listen(port, () => {
            log(`Server ready\n`);
            log(`  http://localhost:${port}\n`);
            log(`  http://localhost:${port}/wc\n`);
            resolve(server);
        });
    });
};
