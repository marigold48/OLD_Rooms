//------------------------------------------------------------------- Reservas
class Bookings extends rLista{
	constructor(nombre,nodos){
		super(nombre,nodos);
		this.meta.iam = 'Bookings';
	}
}
class Reserva extends rNodo {
	constructor(tag,precio,gastos){
		super(tag);
		this.iam = 'Reserva';
		this.obj = {
			grupo_id : '',
			room_id0 :'',
			state  :{tag:'Nuevo',cod:'_NEW'},
			maskdb : 'CASH',
			precio : precio,
			gastos : gastos,
			fianza : precio * 2,
			roomer : new Inquilino(tag),
			periodo : fechas2Lapso('1/10/2017','31/1/2018'),
			checkIO : fechas2Lapso('1/10/2017','31/1/2018'),
			notas : '',
			pagos: []
		}
	}

	setState(nodo){
		this.obj.state.tag = nodo.tag;
		this.obj.state.cod = nodo.cod;
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		
		this.obj.grupo_id  = objDB.obj.grupo_id;
		this.obj.room_id0  = objDB.obj.room_id0;

		this.obj.state  = objDB.obj.state;
		this.obj.maskdb = objDB.obj.maskdb;
		this.obj.precio = objDB.obj.precio;
		this.obj.gastos = objDB.obj.gastos;
		this.obj.fianza = objDB.obj.fianza;
		this.obj.notas  = objDB.obj.notas;

		var roomer = new Inquilino();
		roomer.objDB2Clase(objDB.obj.roomer);
		this.obj.roomer = roomer;

		var periodo = new rLapso(0,-1);
		periodo.objDB2Clase(objDB.obj.periodo);
		this.obj.periodo = periodo;

		var checkIO = new rLapso(0,-1);
		try {checkIO.objDB2Clase(objDB.obj.checkIO);}catch(e){}
		this.obj.checkIO = checkIO;

		var pagos = [];
		try{
				objDB.obj.pagos.map(function(pagoDB,ix){
					var pago = new Pago();
					pago.objDB2Clase(pagoDB);
					pagos.push(pago);
				});} catch(e){alert(e.message);}
		this.obj.pagos = pagos;
	}
}
//------------------------------------------------------------------- vApps Pactos
function initAppPactos(){
	if (r$('h3Pactos')){
		vgk.appH3Pacto = new Vue ({
			el: '#h3Pactos',
			data : {room : 'Ninguno'},
			methods : {
				limpia : function(){this.room = 'Ninguno';},
				actualiza : function(room){this.room = room;},
			}
		})
	}

	if (r$('morePactos')){
		vgk.appMorePactos = new Vue({
			el: '#morePactos',
			data : {modo : 'VIVOS'},
			methods : {
				verTodos : function(){this.modo = 'TODOS';showPactosTodos();},
				verVivos : function(){this.modo = 'VIVOS';showPactosVivos();},
			}
		})
	}
	if (r$('divPactos')){
		vgk.appPacto = new Vue({
			el: '#divPactos',
			data: {pactos : []},
			methods : {
				limpia : function(){this.pactos = [];},
				actualiza : function(pactos){
					this.pactos = pactos;
					if (pactos.length && r$('h3Pagos')) vgk.appH3Pagos.actualiza(pactos[0].tag);
					if (pactos.length && r$('divPagos')) vgk.appPagos.actualiza(pactos[0].obj.pagos);
				},
				editPacto : function(id0){editPacto(id0)},
				cambiaState : function(id0){cambiaStatePacto(id0);},
				addPago   : function(id0){addPago(id0)},
				editUsrRoomer: function(id0){editUsrRoomer(id0);},  // en rooms_Sesion.js
				showPagos :function(id0){renderPagos(id0)},
				liquidac : function(id0){liquidarFianza(id0);}

			}
		}) 
	}
}

//------------------------------------------------------------------- Pagos por defecto
function creaPagosDefault(pacto){
	alert('creaPagosDefault');
	var euros = parseFloat(pacto.obj.precio) + parseFloat(pacto.obj.gastos);

	var periodo = pacto.obj.periodo;
	if (periodo) var meses = getMesesByLapso(periodo);// Devuelve array de Lapsos
	else {alert('periodo NULO !!'); return;}

	var pagos = [];
	meses.map(function(mes){
		var pago = new Pago('ALQ',euros,mes,null);
		pagos.push(pago);
	})
	pacto.obj.pagos = pagos;
	console.log(pagos.length + ' Pagos');
}

//------------------------------------------------------------------- Estados de Bookings
function grabaNuevoState(){
	var stateRoom = '';
	var pacto = vgk.pacto;
	var codTrans = vgk.appEdit.valorSel;
	if (!codTrans) {alert('Sin cambios');return;}

	vgk.fsmRooms.setTransic(codTrans);

	var state = vgk.fsmRooms.getState();
	switch (state.cod){
		case 'ENQR':
		case 'BOOK':
		case 'STBY':
			stateRoom = {tag:'Pendiente',cod:'STBY'};
			break;
		case 'DENY':
		case 'LATE':
		case 'PROB':
		case 'CANC':
			stateRoom = {tag:'Disponible',cod:'FREE'};
			break;
		case 'RENT':
			stateRoom = {tag:'Alquilado',cod:'RENT'};
			break;
		case '_END':
			stateRoom = {tag:'Disponible',cod:'FREE'};
			break;
	}
	pacto.setState(state);
//------------------------------------------------------------------- Crea Pagos !!!
	if (stateRoom.cod == 'RENT') creaPagosDefault(pacto);
//-------------------------------------------------------------------
	console.log(o2s(pacto));
	vgk.pactos.updtNodoSelf(pacto);
	updateBookings();

	vgk.appEdit.room.setState(stateRoom); // actualiza state de la habitación
	vgk.grupo.updtNodoSelf(vgk.appEdit.room);
	updateGrupo();

	vgk.appEdit.showModal = false;
}

function cambiaStatePacto(id0){
	vgk.fsmRooms = creaFSM_Rooms();
	vgk.pacto = vgk.pactos.getNodoById(id0);
	vgk.fsmRooms.setState(vgk.pacto.obj.state.cod);
	var transOK = vgk.fsmRooms.getTransOK();
	var opcs = [];
	opcs.push(vgk.pacto.obj.state);

	transOK.map(function(trans){
		var opc = {};
		opc.tag = trans.tag;
		opc.cod = trans.cod;
		opcs.push(opc);
	})
	vgk.appEdit.opciones = opcs;
	vgk.appEdit.edit_t = "STATE";
	vgk.appEdit.editON = true;
	vgk.appEdit.showModal = true;
}
//------------------------------------------------------------------- Verifica Periodos
// Hace la la INTERSECCION de los periodos de los pactos 'vivos'. Ha de ser NULL
function verificaPeriodos(pacto){
	var lapso1 = pacto.obj.periodo;

	var vivos = getPactosVivos();
	vivos.map(function(vivo){
		var lapso2 = vivo.obj.periodo;
		var solape = intersLapsos(lapso1,lapso2);
		if (solape){ 
			var msg = 'Fechas incompatibles:\n';
			msg += pacto.tag+' : '+lapso1.toStr_I()+'--->'+lapso1.toStr_F() +'\n';
			msg += vivo.tag +' : '+lapso2.toStr_I()+'--->'+lapso2.toStr_F();
			alert(msg);
			return false;
		}
	})

	return true;
}

//------------------------------------------------------------------- Eliminar Reservas
function ecoBorraBookings(xhr){
	console.log(xhr.responseText);
}

function borraBookings(_id){
	alert('Borra: '+_id)
	if (_id != 'NdN'){
		var params = vgApp.paramsXHR;
		params.base = '/testRooms/';
		params.eco = ecoBorraBookings;
		params.topolId = _id;
		ajaxDeleteTopol(params);
		return false;
	}

}

//-------------------------------------------------------------------Bookings
function getPactosVivos(){
	var vivos = [];
	if (!vgk.pactos) return vivos;
	var nodos = vgk.pactos.nodos;
	nodos.map(function(nodo){
		if (!nodo.obj.state) nodo.obj.state = {tag : 'Nuevo',cod:'_FREE'}; // Pruebas
		switch(nodo.obj.state.cod) {
			case '_NEW':
			case 'ENQR':
			case 'BOOK':
			case 'STBY':
			case 'RENT':
				vivos.push(nodo);
		}
	})
	return vivos;
}

function showPactosTodos(){
	var todos = rRev(vgk.pactos.nodos)
	vgk.appPacto.actualiza(todos);

}
function showPactosVivos(){
	var vivos = rRev(getPactosVivos());
	vgk.appPacto.actualiza(vivos);

}

function actualizaAppBookings(){
	if (vgk.pactos){
		vgk.appPacto.actualiza(vgk.pactos.nodos);
		if (vgk.appMorePactos.modo == 'VIVOS') showPactosVivos();
		else showPactosTodos();
	}
	else { 
		vgk.appPacto.actualiza([]);
	}
}


function ecoUpdtBookings(xhr){
	console.log('eco Updt Bookings');
}

function updateBookings(){
	var params = vgApp.paramsXHR;
	params.base = '/testRooms/';
	params.eco = ecoUpdtBookings;
	params.txt = o2s(vgk.pactos.clase2ObjDB());
	params.topolId = vgk.pactos_id;
	ajaxPutTopol(params);
	return false;
}

function ecoGetUnBookings(xhr){
	var jsonTxt = xhr.responseText;
	if (jsonTxt.length > 10){
		var objDB = JSON.parse(jsonTxt);
		vgk.pactos = new Bookings('nada',[]);
		vgk.pactos.objDB2Clase(objDB);
	}
	else vgk.pactos = null;

	vgk.postGetUnBookings();
}


function getUnBookings(_id,eco){
	vgk.pactos_id = _id;

	var params = vgApp.paramsXHR;
	params.base = '/testRooms/';
	params.eco = ecoGetUnBookings;
	params.topolId = _id;

	ajaxGet1Topol(params);

	return false;

}

function showPactos(id){
	vgk.pactos = null;
	var room = vgk.grupo.getNodoById(id);
	vgk.appEdit.room = room;
	vgk.appH3Pacto.actualiza(room.tag);
	var _id = room.obj.pactos_id;
	if (_id != 'NdN'){ 
		vgk.postGetUnBookings = actualizaAppBookings;
		getUnBookings(_id);
		return false;
	}
	else {
		vgk.appPacto.actualiza([]);
	}
}

//------------------------------------------------------------------- Creación Listas de Bookings
// Si se intenta crear un pacto, y no hay lista (Bookings), se crea, se graba
// En el eco se activa el form de Nuevo Pacto

function grabaNuevoPacto(){
	var pacto = vgk.appEditBig.pacto;
	var periodo = fechas2Lapso(vgk.appEditBig.fechas[0],vgk.appEditBig.fechas[1]);
	pacto.obj.periodo = periodo;
	var checkIO = fechas2Lapso(vgk.appEditBig.fechas[2],vgk.appEditBig.fechas[3]);
	pacto.obj.checkIO = checkIO;

	var ok = verificaPeriodos(pacto);
	if(!ok){
		// Poner aquí tratamiento si hay incompatibilidad
		}

	if (vgk.appEditBig.editON) vgk.pactos.updtNodoSelf(pacto);
	else vgk.pactos.addNodo(pacto);

//	vgk.appPacto.actualiza(vgk.pactos.nodos);
	if (vgk.appMorePactos.modo == 'VIVOS') showPactosVivos();
	else showPactosTodos();

	vgk.appEditBig.showModal = false;
	// Update la lista en BD
	updateBookings();
}


function creaNuevoPacto(){
	var room = vgk.appEdit.room;
	vgk.appEditBig.showModal = false;
	vgk.appEditBig.edit_t = "PACTO";
	vgk.appEditBig.editON = false;
	if (vgk.appModo.random) var pacto = new rndReserva('',room.obj.precio,room.obj.gastos);
	else var pacto = new Reserva('',room.obj.precio,room.obj.gastos);
//	pacto.setState(room.obj.state);
	pacto.obj.grupo_id = vgk.grupo_id;
	pacto.obj.room_id0 = room.id0;
	vgk.appEditBig.pacto = pacto;
	vgk.appEditBig.fechas[0] = pacto.obj.periodo.toStr_I();
	vgk.appEditBig.fechas[1] = pacto.obj.periodo.toStr_F();
	vgk.appEditBig.fechas[2] = pacto.obj.checkIO.toStr_I();
	vgk.appEditBig.fechas[3] = pacto.obj.checkIO.toStr_F();
	vgk.appEditBig.showModal = true;

}




//------------------------------------------------------------------- Listas de Bookings
function creaListaBookings(eco){
	if (vgk.pactos.meta.org != vgk.user.org){
		alert('Bookings sin ORG:' + vgk.pactos.meta.org +':'+ vgk.user.org);
		vgk.pactos.meta.org = vgk.user.org;
	};

	var params = vgApp.paramsXHR;
	params.base = '/testRooms/';
	params.eco = eco;
	params.txt = o2s(vgk.pactos.clase2ObjDB());
	ajaxPostTopol(params);
	return false;

}

function ecoCreaBookings(xhr){
	var roomId = vgk.appEdit.room.id0;
	var room = vgk.grupo.getNodoById(roomId);
	vgk.pactos_id = JSON.parse(xhr.responseText)._id;
	room.obj.pactos_id = vgk.pactos_id;
	updateGrupo();
	vgk.appPacto.actualiza([]);
	creaNuevoPacto();
}

function creaBookings(room){
	var flat = vgk.grupo.getNodoById(room.id0);
	vgk.pactos = new Bookings('Reservas'+flat.obj.codFlat+'_'+room.obj.codRoom,[]);

	var params = vgApp.paramsXHR;
	params.base = '/testRooms/';
	params.eco = ecoCreaBookings;
	params.txt = o2s(vgk.pactos.clase2ObjDB());
	ajaxPostTopol(params);
	return false;
}

//------------------------------------------------------------------- Crear un Nuevo Pacto

// Se invoca desde booking.html
function hookNuevoPacto(id0){
	var room = vgk.appEdit.room;
	if (room.obj.pactos_id == 'NdN') creaBookings(room);
	else creaNuevoPacto();
}

// Se invoca desde booking.html
function editPacto(id){
	var pacto = vgk.pactos.getNodoById(id);
	vgk.appEditBig.edit_t = "PACTO";
	vgk.appEditBig.editON = true;
	vgk.appEditBig.pacto = pacto;
	vgk.appEditBig.fechas[0] = pacto.obj.periodo.toStr_I();
	vgk.appEditBig.fechas[1] = pacto.obj.periodo.toStr_F();
	vgk.appEditBig.fechas[2] = pacto.obj.checkIO.toStr_I();
	vgk.appEditBig.fechas[3] = pacto.obj.checkIO.toStr_F();
	vgk.appEditBig.showModal = true;

}