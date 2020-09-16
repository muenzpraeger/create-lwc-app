const compression = require('compression');
const helmet = require('helmet');
const express = require('express');
import { resolve } from 'path';

const app = express();
app.use(helmet());
app.use(compression());

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3001;
const DIST_DIR = './dist';

app.use(express.static(DIST_DIR));

app.use('*', (req: any, res: any) => {
    res.sendFile(resolve(DIST_DIR, 'index.html'));
});

app.listen(PORT, () =>
    console.log(`✅ Server started: http://${HOST}:${PORT}`)
);
