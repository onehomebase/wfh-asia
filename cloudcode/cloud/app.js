var express = require('express');

var app = express();

// Global app configuration section
app.set('json spaces', 4);
app.use(express.bodyParser());
app.use(express.methodOverride());

// Controllers
var reasonsController = require('cloud/controllers/reasons.js');
var votesController = require('cloud/controllers/votes.js');

// Routes
app.get('/getRandomReason/:country', reasonsController.getRandomReasons);
app.post('/reason', reasonsController.save);
app.post('/vote', votesController.save);

app.listen();