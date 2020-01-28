'use strict';

module.exports = function(app) {
	var roomsCtrl = require('../controllers/rooms_TestController');

//------------------------------------------------------------------- Index - Route
	app.route('/')
		.get(roomsCtrl.get_Raiz);

//------------------------------------------------------------------- Shell Scripts
	app.route('/shell/oracle/')
		.post(roomsCtrl.SQL_Oracle);

	app.route('/shell/sqlite/')
		.post(roomsCtrl.SQL_SQLite);

	app.route('/shell/encript/')
		.post(roomsCtrl.encriptPWD);

//------------------------------------------------------------------- MongoDB
	app.route('/testRooms') 
		.get(roomsCtrl.findAll)
		.post(roomsCtrl.add);

	app.route('/owners/:org') 
		.get(roomsCtrl.findOwners);

	app.route('/pisos/:org') 
		.get(roomsCtrl.findPisos);

	app.route('/metas/:iam') 
		.get(roomsCtrl.findMetas);

	app.route('/testRooms/:id') 
		.get(roomsCtrl.findById)
		.put(roomsCtrl.update)
		.delete(roomsCtrl.delete);

};





