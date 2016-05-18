var Statuses = require('../models/status');

module.exports = function (app) {
    //
    // GET: /api/v1/statuses
    // get all possible status values
    app.get('/api/v1/statuses', function (req, res) { 
        return res.json(Statuses);
    });
};
