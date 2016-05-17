var supertest = require('supertest');

var server = supertest.agent('http://localhost:10100');

describe('Get order by order id', function () {
    it ('should return null when order id does not exist', function (done) {
      server
        .get('/api/v1/order/000000000000000000000000')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .expect(null, done);
    });
    
    it ('should return 404 when order id invalid', function (done) {
      server
        .get('/api/v1/order/1')
        .expect(404, done);
    });
});
