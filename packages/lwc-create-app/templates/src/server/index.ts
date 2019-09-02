import { Express } from 'express';

export default function(app: Express): void {
    // put your express app logic here
    app.get('/some/api', (req, res) => {
        // do stuff
        res.json({ status: 'ok' });
    });
}
