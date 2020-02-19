const compression = require('compression');
const helmet = require('helmet');
const express = require('express');
import * as path from 'path';

const app = express();
app.use(helmet());
app.use(compression());

const DIST_DIR = './dist';

app.use(express.static(DIST_DIR));

app.use('*', (req: any, res: any) => {
    res.sendFile(path.resolve(DIST_DIR, 'index.html'));
});
