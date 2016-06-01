module.exports = function(app) {
  //
  // GET: /api/v1/healthcheck
  // get all possible status values
  app.get('/api/v1/healthcheck', function(req, res) {
    return res.json('ALL IS WELL');
  });
};
