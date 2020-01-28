// Para listar los propietarios: (con _id, tag, id0)
// db.topols.aggregate([{$unwind:"$nodos"},{$match:{"nodos.iam":"Propietario"}},{ $project : {"nodos.tag":1,"nodos.id0":1}}]);


var mongoose = require('mongoose');
var DemoRooms = mongoose.model('topol');


//
exports.get_Raiz = function(req,res){
	return 'App Gestion alquiler habitaciones'
}

//------------------------------------------------------------------- shell scripts
// Ejecutar sentencia SQL / Oracle
exports.SQL_Oracle = function(req, res){
	var params = req.body;
	var id = params.id;
	var db = params.db;
	var ruta = params.path;
	var stmt = params.stmt;

	var exec = require('child_process').exec;
	function eco(error, stdout, stderr) {res.send(stdout);}
	exec("./k1GetQryORCL.cgi "+id+' '+db+' '+ruta+' '+stmt, eco);
}


// Ejecutar sentencia SQL / SQLite
exports.SQL_SQLite = function(req,res){
	var params = req.body;
	var id = params.id;
	var db = params.db;
	var ruta = params.path;
	var stmt = params.stmt;

	var exec = require('child_process').exec;
	function eco(error, stdout, stderr) {res.send(stdout);}
	exec("./k1GetQryLite.cgi "+id+' '+db+' '+ruta+' '+stmt, eco);
};

// Obtener md5 de un usuario/password
exports.encriptPWD = function(req,res){
	var params = req.body;
	var id = params.id;
	var usr = params.usr;
	var pwd = params.pwd;
	var ruta = params.ruta;

	var exec = require('child_process').exec;
	function eco(error, stdout, stderr) {res.send(stdout);}
	exec("./k1EncriptPWD.cgi "+id+' '+usr+' '+pwd+' '+ruta, eco);
};

//------------------------------------------------------------------- MongoDB
//GET Aggregate - Retorna los owners
exports.findOwners = function(req, res) {
	DemoRooms.aggregate([
			{$unwind:"$nodos"},
			{$match: { $and: [ {"meta.iam":"Grupo"},{"meta.org":{$eq : req.params.org}},{ "nodos.iam":"Propietario"}] } },
			{ $project : {"nodos.tag":1,"nodos.id0":1,"nodos.obj.nombre":1,"nodos.obj.apell":1}}
		], 
		function(err, topols) {
			if(err) res.status(500).jsonp(err.message);
			console.log('GET Aggregate Owners de: ' + req.params.org);
			res.status(200).jsonp(topols);
		});
};

//GET Aggregate - Retorna los pisos
exports.findPisos = function(req, res) {
	DemoRooms.aggregate([
			{$unwind:"$nodos"},
			{$match: { $and: [ {"meta.iam":"Grupo"},{"meta.org":{$eq : req.params.org}},{ "nodos.iam":"Piso"}] } },
			{ $project : {"nodos.tag":1,"nodos.id0":1,"nodos.obj.direcc":1,"nodos.obj.codpostal":1}}
		], 
		function(err, topols) {
			if(err) res.status(500).jsonp(err.message);
			console.log('GET Aggregate Pisos de: '+ req.params.org)
			res.status(200).jsonp(topols);
			});
};


//GET Lista de {meta}'s' de las topologias
exports.findAll = function(req, res) {
	DemoRooms.find({}, 'meta',function(err, topols) {
		if(err) res.status(500).jsonp(err.message);
		console.log('GET All')
		res.status(200).jsonp(topols);
	});
};

//GET Lista de {meta}'s' por {iam} de las topologias
exports.findMetas = function(req, res) {
	DemoRooms.find({"meta.iam":req.params.iam}, 'meta',function(err, topols) {
		if(err) res.status(500).jsonp(err.message);
		console.log('GET metas: '+req.params.iam)
		res.status(200).jsonp(topols);
	});
};

//GET - Retorna una topologia con un _id especificado
exports.findById = function(req, res) {
	DemoRooms.findById(req.params.id, function(err, topol) {
		if(err) return res.status(500).jsonp(err.message);
		console.log('GET by _id :' + req.params.id);
		res.status(200).jsonp(topol);
	});
};

//POST - Inserta una nueva topologia
exports.add = function(req, res) {
	var topol = new DemoRooms({
		meta: req.body.meta,
	 	nodos: req.body.nodos
	});
	topol.save(function(err, topol) {
		if(err) return res.status(500).send(err.message);
		console.log('POST');
		res.status(200).jsonp(topol);
	});
};

//PUT - Update una topologia ya existente
exports.update = function(req, res) {
	DemoRooms.findById(req.params.id, function(err, topol) {
		topol.meta = req.body.meta || {};
		topol.nodos = req.body.nodos || [];
		topol.save(function(err) {
			if (err) return res.status(500).jsonp(err.message);
			console.log('PUT: '+req.params.id);
			res.status(200).jsonp(topol);
		});
	});
};

//DELETE - Delete una topologia con un _id especificado
exports.delete = function(req, res) {
	DemoRooms.findById(req.params.id, function(err, topol) {
		topol.remove(function(err) {
			if(err) return res.status(500).jsonp(err.message);
			console.log('DEL: '+req.params.id);
			res.json({ message: 'Successfully deleted' });
		});
	 });
};