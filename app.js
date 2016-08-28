var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var items = require('./items');

//Setup middleware.
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//REST HTTP Methods
app.get('/items', items.list);
app.get('/items/:id', items.find);
app.post('/items', items.create);

app.listen(8080);
// console.log('App started on ' + appEnv.bind + ':' + appEnv.port);
console.log('App started on 8080 at ' + new Date().toISOString());