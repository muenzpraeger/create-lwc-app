// eslint-disable-next-line no-undef
module.exports = app => {
    // put your express app logic here
    app.get('/some/api', (req, res) => {
        // do stuff
        res.json({ status: 'ok' });
    });
};
