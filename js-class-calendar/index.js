// Modules:
var express = require('express');
var Acuity = require('acuityscheduling');
var bodyParser = require('body-parser');

// App:
var app = express();
var acuity = Acuity.basic(require('./config'));

// Live-reload for development:
if (process.env.NODE_ENV === 'development') {
  var port = 35724;
  var server = require('livereload').createServer({ port: port });
  server.watch(__dirname + '/public');
  app.use(require('connect-livereload')({ port: port }));
  console.log('Livereload on ' + port);
}

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/api/classes', function (req, res) {
  acuity.request('availability/classes?month='+req.query.month, function (err, r) {
    if (err) return console.error(err);
    res.send(r.body);
  });
});

app.post('/api/appointment', function (req, res) {
  var options = {
    method: 'post',
    body: req.body
  };
  acuity.request('appointments', options, function (err, r) {
    if (err) return console.error(err);
    if (r.statusCode === 200) {
      res.send(r.body);
    } else {
      res.status(400).send({
        error: r.statusCode === 400 ? r.body.message : 'Unknown error.'
      });
    }
  });
});

app.listen(3000, function () {
  console.log('Hello from 3000.');
});
