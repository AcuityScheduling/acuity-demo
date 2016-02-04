var calendar = require('./calendar');
var $ = require('jquery');

calendar({
  container: $('#classes'),
  firstName: 'Bob',
  lastName: 'Burger',
  email: 'legopartytime+bob@gmail.com'
});
