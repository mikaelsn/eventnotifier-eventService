var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var mongoose = require('mongoose');
var nconf = require('nconf');
nconf.file('./app/config.json');
var api = require('./events');
var email = require('./mailer');
var auth = require('./auth');

var populateDB = require('./populate-db');

//Init db
var uristring = 'mongodb://' + process.env.MONGO_PORT_27017_TCP_ADDR + ':' + process.env.MONGO_PORT_27017_TCP_PORT;
mongoose.Promise = global.Promise; //see https://github.com/Automattic/mongoose/issues/4291
mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log('Succeeded connected to: ' + uristring);
    populateDB();
  }
});

//Setup middleware.
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//REST HTTP Methods
app.get('/items', auth.isAuthenticated, api.list);
app.get('/items/:id', auth.isAuthenticated, api.find);
app.post('/items/:id', auth.isAuthenticated, api.update);
app.post('/items', auth.isAuthenticated, api.create);
app.get('/email', email.email);

app.listen(8080);
console.log('App started on 8080 at ' + new Date());