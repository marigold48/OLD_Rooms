
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
//var cors = require('cors');

var fs = require('fs');
var util = require('util');

var app = express();

app.use("/", express.static("./TallerRooms/html/real"));
app.use("/img", express.static("./TallerRooms/img"));
app.use("/lib", express.static("./TallerRooms/lib"));
//------------------------------------------------------------------- C O R S
app.use(function (req, res, next) {

	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', 'http://marigold.es');

	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true);

	// Pass to next layer of middleware
	next();
});

//------------------------------------------------------------------- Connection to DB
mongoose.connect('mongodb://localhost/realRooms', function(err, res) {
	if(err) throw err;
	console.log('Connected to Database');
});

// Middlewares
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json()); 
app.use(methodOverride());

// Import Models, Controllers and Routes
var models = require('./models/rooms_RealModel')(app, mongoose);
var control = require('./controllers/rooms_RealController');
var router = require('./routes/rooms_RealRoutes');
router(app); //register the route

//------------------------------------------------------------------- Start server
app.listen(3301, function() {
	console.log("App Rooms (Real) en http://localhost:3301");
});

//------------------------------------------------------------------- Debug log
var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

