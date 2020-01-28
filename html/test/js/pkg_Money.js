//------------------------------------------------------------------- Rebuts
class Rebuts extends rArbol{
	constructor(nombre,nodos){
		super(nombre,nodos);
		this.iam = 'Rebuts';
	}
	getRebutsCap(){
		var raspa = this.getRaspa();
		var n = raspa.length;
		for (var i=0;i<n;i++){
			if (raspa[i].iam == 'RebutsCap') return (raspa[i]);
		}

	}

	getGastos(){ 
		var gastos = [];
		var vista = {};
		var gastosT = this.getGastosT();
		gastosT.map(function(gasto_t){
			vista[gasto_t.cod] = gasto_t.obj.visible;
		})

// hace un full scan, porque la mayoría son gastos
		var n = this.nodos.length;
		for (var i=1;i<n;i++){
			var nodo = this.nodos[i];
			if (nodo.iam == 'Gasto' && vista[nodo.obj.tipo]) gastos.push(nodo)
		}
		return gastos;
	}

	getGastosT(){ 
		var gastosT = [];
		var cap = this.getRebutsCap();
		var n = cap.hijos.length;
		for (var i=0;i<n;i++){
			var nodo = this.getNodoById(cap.hijos[i]);
			gastosT.push(nodo)
		}
		return gastosT;
	}

	getGastosVue(jar){ // para visualizar calendario (año = jar)
		var tipos = [];
		var gastosT = this.getGastosT();

		gastosT.map(function(gastoT){
			var vGastoT = {tag : gastoT.tag, cod:gastoT.cod, cargos : [0,0,0,0,0,0,0,0,0,0,0,0]};
			tipos.push(vGastoT);
		});
		var n = tipos.length;

		var lapsoJar = getLapsoByJar(jar);

		var gastos = this.getGastos();
		gastos.map(function(gasto){
			var intersecc = intersLapsos(gasto.obj.cargo,lapsoJar);
			if (intersecc){
				var mes = parseInt(gasto.getMes());
				for (var i=0;i<n;i++){
					if (tipos[i].cod == gasto.obj.tipo){
						tipos[i].cargos[mes-1] = gasto.obj.euros;
					}
				}
			};
		})
		return tipos;
	}

	addNodoGasto(gasto){
		var raiz = this.getRaiz();
		this.addNodoHijo(raiz,gasto);
	}
}

class RebutsCap extends rNodo{
	constructor(tag){
		super('Cap');
		this.iam = 'RebutsCap';
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
	}
}

class RebutsCos extends rNodo{
	constructor(tag){
		super('Cos');
		this.iam = 'RebutsCos';
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
	}
}

class Gasto_t extends rNodo{
	constructor(tag,cod){
		super(tag);
		this.iam = 'Gasto_t';
		this.cod = cod;
		this.obj ={
			visible : true,
			maskCSV : ''
		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.cod = objDB.cod;
		this.obj = objDB.obj;
	}

}
class Gasto extends rNodo{
	constructor(tag){
		super(tag);
		this.iam = 'Gasto';
		this.obj = { 
			tipo : '' ,
			euros : 0,
			periodo : new rLapso(),
			cargo : new rLapso(),
		}
	}

	getMes(){
		var strI = this.obj.cargo.toStr_I();
		return strI.split('/')[1];
	}

	getClau (){
		return (''+this.obj.euros+this.obj.tipo+this.obj.cargo.uta);
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.obj.tipo = objDB.obj.tipo; // Luz, Gas, Agua, WiFi, Limpieza, etc
		this.obj.euros = objDB.obj.euros;

		var periodo = new rLapso();
		periodo.objDB2Clase(objDB.obj.periodo);
		this.obj.periodo = periodo;

		var cargo = new rLapso();
		cargo.objDB2Clase(objDB.obj.cargo);
		this.obj.cargo = cargo;

	}
}

//------------------------------------------------------------------- Pagos
// periodo y fecha ingreso (fingr) son clases rLapso
// si fingr es null, el pago no está confirmado

class Pago{
	constructor(tipo,euros,periodo,fingr){
		this.tipo = tipo; // ALQ, FZA, LIQ
		this.modo = 'CASH'; // [BANK|CASH]
		this.euros =  euros;
		this.periodo = periodo;
		this.fingr = fingr || new rLapso();
	}

	objDB2Clase(objDB){
		this.tipo = objDB.tipo; 
		this.modo = objDB.modo;
		this.euros = objDB.euros;

		var periodo = new rLapso();
		periodo.objDB2Clase(objDB.periodo);
		this.periodo = periodo;
		var fingr = new rLapso();
		try {fingr.objDB2Clase(objDB.fingr);}catch(e){}
		this.fingr = fingr;
	}
}

//------------------------------------------------------------------- vApps Money
function initAppMoney(){
	if (r$('h3Gastos')){
		vgk.appH3Gastos = new Vue ({
			el: '#h3Gastos',
			data : {flat : 'Ninguno'},
			methods : {
				limpia : function(){this.flat = 'Ninguno';},
				actualiza : function(flat){this.flat = flat;}
			}
		})
	}


	if (r$('h3Pagos')){
		vgk.appH3Pagos = new Vue ({
			el: '#h3Pagos',
			data : {pacto : 'Ninguno'},
			methods : {
				limpia : function(){this.pacto = 'Ninguno';},
				actualiza : function(pacto){this.pacto = pacto;}
			}
		})
	}

	if (r$('h3Import')){
		vgk.appH3Import = new Vue ({
			el: '#h3Import',
			data : {flat : 'Ninguno'},
			methods : {
				limpia : function(){this.flat = 'Ninguno';},
				actualiza : function(flat){this.flat = flat;}
			}
		})
	}
	if(r$('divGastos')){
		vgk.appGastos = new Vue({
			el: '#divGastos',
			data: {
				gastos : [],
				vista : []
			},
			methods : {
				actualiza : function(gastos){this.gastos = gastos},
				editGasto : function(id0){editGasto(id0)},
				creaGasto : function(id0){creaGasto(id0)},
			}
		}) 
	}

	if (r$('divPagos')){
		vgk.appPagos = new Vue({
			el: '#divPagos',
			data: {pagos : []},
			methods : {
				actualiza : function(pagos){this.pagos = pagos},
				editPago : function(ix){editPago(ix)},
			}
		}) 
	}
	if (r$('divImport')){
		vgk.appImport = new Vue({
			el: '#divImport',
			data: {csv : ''},
			methods : {
				actualiza : function(csv){this.csv = csv},
				importar : function(){importMovsBank();},
			}
		}) 
	}

	if (r$('divCargosJar')){
		vgk.appCargosJar = new Vue({
			el: '#divCargosJar',
			data:{
				jar : 2015,
				meses : ['Tipos', 'Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
				tipos : [
					{tag:'Luz',cargos:[1,2,3,4,5,6,7,8,9,10,11,12]},
					{tag:'Agua',cargos:[1,2,3,4,5,6,7,8,9,10,11,12]},
					{tag:'Gas',cargos:[1,2,3,4,5,6,7,8,9,10,11,12]},
					{tag:'WiFi',cargos:[1,2,3,4,5,6,7,8,9,10,11,12]}
					],

			}
		})
	}
}

//------------------------------------------------------------------- Editar Tipos de Gasto

function grabaNuevoGastoT(){
	var clon = vgk.appEdit.gasto_t;
	clon.obj.visible = vgk.appEdit.chkValor;
	vgk.rebuts.updtNodoSelf(clon);
	updateRebuts();
	vgk.appEdit.showModal = false;
	vgk.appEditBig.showModal = false;
	editRebuts();
}

// Se invoca a traves de vgk.appEdit methods
function editGastoT(id0,ix){
	var gasto_t = vgk.rebuts.getNodoById(id0);
	var clon = new Gasto_t(gasto_t.tag,gasto_t.cod);
	clon.id0 = gasto_t.id0;
	clon.id1 = gasto_t.id1;
	clon.obj.maskCSV = gasto_t.obj.maskCSV;

	vgk.appEdit.edit_t = "GASTO_T";
	vgk.appEdit.editON = true;
	vgk.appEdit.gasto_t = clon; // clonamos, para desacoplar el edit
	vgk.appEdit.ix = ix;
	vgk.appEdit.chkValor = clon.obj.visible;
	vgk.appEdit.showModal = true;
}

function editRebuts(){
	var tipos = vgk.rebuts.getGastosT();
	console.log(o2s(tipos));
	vgk.appEditBig.rebuts = tipos;
	vgk.appEditBig.edit_t = "REBUTS";
	vgk.appEditBig.editON = true;
	vgk.appEditBig.showModal = true;
}

//------------------------------------------------------------------- Vista Gastos
function setVistaGastos(){
	var codsOK = vgk.appEdit.valores;
	console.log('set: '+o2s(codsOK));
	var tipos = vgk.rebuts.getGastosT();
	tipos.map(function(tipo){
		if (codsOK.indexOf(tipo.cod) == -1) tipo.obj.visible = false;
		else tipo.obj.visible = true;
		vgk.rebuts.updtNodoSelf(tipo);
	})
	actualizaAppGastos();
	vgk.appEdit.showModal = false;
}
function setAppVista(){
	var tipos = vgk.rebuts.getGastosT();
	var opciones = []; 
	var valores = [];
	tipos.map(function(tipo){
		var opc = {};
		opc.cod = tipo.cod;
		opc.tag = tipo.tag;
		if (tipo.obj.visible) valores.push(tipo.cod);
		opciones.push(opc);
	})

	vgk.appEdit.opciones = opciones;
	vgk.appEdit.valores  = valores;

	vgk.appEdit.edit_t = "VISTA";
	vgk.appEdit.editON = true;
	vgk.appEdit.showModal = true;
}

//------------------------------------------------------------------- Eliminar Gastos piso
function ecoBorraRebuts(xhr){
	console.log(xhr.responseText);
}

function borraRebuts(_id){
	alert('Borra: '+_id)
	if (_id != 'NdN'){
		var params = vgApp.paramsXHR;
		params.base = '/testRooms/';
		params.eco = ecoBorraRebuts;
		params.topolId = _id;
		ajaxDeleteTopol(params);
		return false;
	}

}

//------------------------------------------------------------------- Rebuts

function ecoUpdtRebuts(xhr){
	console.log('ecoUpdtRebuts');
}

function updateRebuts(){
	var params = vgApp.paramsXHR;
	params.base = '/testRooms/';
	params.eco = ecoUpdtRebuts; 
	params.topolId = vgk.rebuts_id;
	params.txt = o2s(vgk.rebuts.clase2ObjDB());
	ajaxPutTopol(params);

}
function grabaNuevoGasto(){
	var gasto = vgk.appEdit.gasto;
	var periodo = fechas2Lapso(vgk.appEdit.fechas[0],vgk.appEdit.fechas[1]);
	gasto.obj.periodo = periodo;
	var cargo = fechas2Lapso(vgk.appEdit.fechas[2],vgk.appEdit.fechas[2]);
	gasto.obj.cargo = cargo;
	var cod = vgk.appEdit.valorSel;
	alert(cod+':'+vgk.appEdit.editON);
	gasto.tipo = cod;
	console.log(o2s(gasto));
	if (vgk.appEdit.editON) vgk.rebuts.updtNodoSelf(gasto);
	else{ 
		vgk.rebuts.addNodoGasto(gasto);
		}
	vgk.appEdit.showModal = false;

	// refresh appRebuts
	vgk.appGastos.actualiza(vgk.rebuts.getGastos());

	// Update Rebuts en BD
	updateRebuts();
}

// para form edit Gasto
function getOpcionesGastosT(){
	var opcs = [];
	var opc0 = {};
	opc0.tag = 'Seleccionar';
	opc0.cod = 'NdN';
	opcs.push(opc0);
	var gastosT = vgk.rebuts.getGastosT();
	gastosT.map(function(tipo){
		var opc = {};
		opc.tag = tipo.tag;
		opc.cod = tipo.cod;
		opcs.push(opc);
	})
	return opcs;
}
function editGasto(id0){
	var gasto = vgk.rebuts.getNodoById(id0);
	vgk.appEdit.edit_t = "GASTO";
	vgk.appEdit.editON = true;
	var opcs = getOpcionesGastosT();
	vgk.appEdit.opciones = opcs;
	vgk.appEdit.gasto = gasto;
	vgk.appEdit.fechas[0] = gasto.obj.periodo.toStr_I();
	vgk.appEdit.fechas[1] = gasto.obj.periodo.toStr_F();
	vgk.appEdit.fechas[2] = gasto.obj.cargo.toStr_I();
	vgk.appEdit.showModal = true;

}

function creaGasto(){
	var gasto = new Gasto();
	gasto.tag = '';
	vgk.appEdit.showModal = false;
	vgk.appEdit.edit_t = "GASTO";
	var opcs = getOpcionesGastosT();
	vgk.appEdit.opciones = opcs;
	vgk.appEdit.editON = false;
	vgk.appEdit.gasto = gasto;
	vgk.appEdit.fechas[0] = gasto.obj.periodo.toStr_I();
	vgk.appEdit.fechas[1] = gasto.obj.periodo.toStr_F();
	vgk.appEdit.fechas[2] = gasto.obj.cargo.toStr_I();
	vgk.appEdit.showModal = true;

}

//------------------------------------------------------------------- CRUD Rebuts (Arbol de Gastos)
function ecoGrabaRebuts(xhr){
	var resp = JSON.parse(xhr.responseText);
	vgk.rebuts_id = resp._id;
	var flat = vgk.appEdit.flat;
	flat.obj.gastos_id = resp._id;
	vgk.grupo.updtNodoSelf(flat);
	console.log('Actualizado Gastos piso: '+ flat.tag +'-->'+ resp._id);
	updateGrupo();
	return false;
}

function grabaRebuts(flat){
	var raiz = new rNodo(flat.tag);
	vgk.rebuts = new Rebuts('Gastos_'+flat.obj.codPiso,[raiz]);

	var cap = new RebutsCap('');
	vgk.rebuts.addNodoHijo(raiz,cap);

	var luz = new Gasto_t('Luz','LUZ');	luz.obj.maskCSV = 'R/ Som Energia';
	vgk.rebuts.addNodoHijo(cap,luz);

	var gas = new Gasto_t('Gas','GAS');	gas.obj.maskCSV = 'R/ Gas Natural';
	vgk.rebuts.addNodoHijo(cap,gas);

	var H2O = new Gasto_t('Agua','AGUA');	H2O.obj.maskCSV = 'R/ AIGUES';
	vgk.rebuts.addNodoHijo(cap,H2O);

	var www = new Gasto_t('WiFi','WIFI');	www.obj.maskCSV = 'R/ TELEFONICA';
	vgk.rebuts.addNodoHijo(cap,www);

	var cos = new RebutsCos('');
	vgk.rebuts.addNodoHijo(raiz,cos);
	
	vgk.rebuts.meta.org = vgk.user.org;

	var params = vgApp.paramsXHR;
	params.base = '/testRooms/';
	params.eco = ecoGrabaRebuts; 
	params.iam = 'Rebuts';
	params.txt = o2s(vgk.rebuts.clase2ObjDB());
	ajaxPostTopol(params);

	vgk.appEdit.showModal = false;
}


function actualizaAppGastos(){
	vgk.appGastos.actualiza(vgk.rebuts.getGastos());
}

function ecoGetUnRebuts(xhr){
		var respTxt = xhr.responseText;
		vgk.loTopol = JSON.parse(respTxt);
		vgk.rebuts_id = vgk.loTopol._id;
		vgk.rebuts = new Rebuts("",[]);
		vgk.rebuts.objDB2Clase(vgk.loTopol);

		vgk.postGetUnRebuts();
}


function getUnRebuts(_id){
	vgk.rebuts_id = _id;
	var params = vgApp.paramsXHR;
	params.base = '/testRooms/';
	params.eco = ecoGetUnRebuts;
	params.topolId = _id;

	ajaxGet1Topol(params);

	return false;
}

function showGastos(id0){
	var flat = vgk.grupo.getNodoById(id0);
	if (!flat.obj.gastos_id || flat.obj.gastos_id == 'NdN'){
		vgk.appEdit.flat = flat;
		grabaRebuts(flat);
	}
	else {
		vgk.postGetUnRebuts = actualizaAppGastos;
		getUnRebuts(flat.obj.gastos_id );
	}

}
//------------------------------------------------------------------- Pagos
function renderPagos(id){
	var pacto = vgk.pactos.getNodoById(id);
	vgk.appH3Pagos.actualiza(pacto.tag)
	r$('tab2').click();
	vgk.appEdit.pacto = pacto;
	vgk.appPagos.actualiza(pacto.obj.pagos);
}

function grabaNuevoPago(){
	var pago = vgk.appEdit.pago;
	var periodo = fechas2Lapso(vgk.appEdit.fechas[0],vgk.appEdit.fechas[1]);
	pago.periodo = periodo;

	var fingr = fechas2Lapso(vgk.appEdit.fechas[2],vgk.appEdit.fechas[2]);
	pago.fingr = fingr;

	var pacto = vgk.appEdit.pacto;

	var ix = vgk.appEdit.ix;
	if (vgk.appEdit.editON) pacto.obj.pagos[ix] = pago;
	else{ 
		pacto.obj.pagos.push(pago);
//		vgk.appPagos.pagos.push(pago);
	}
	var _id = vgk._id;

	vgk.pactos.updtNodoSelf(pacto);

	vgk.appEdit.showModal = false;
	// Update la lista en BD

	var url = vgk.urlServer+':'+vgk.portNode;
	var xhr = getXHR('PUT',url +'/api/DemoRooms/'+_id, ecoUpdtPactos);
	xhr.send(JSON.stringify(vgk.pactos.clase2ObjDB()));
}


function editPago(ix){
	var pacto = vgk.appEdit.pacto;
	var pago = pacto.obj.pagos[ix];
	vgk.appEdit.edit_t = "PAGO";
	vgk.appEdit.editON = true;
	vgk.appEdit.ix = ix;
	vgk.appEdit.pago = pago;
	vgk.appEdit.fechas[0] = pago.periodo.toStr_I();
	vgk.appEdit.fechas[1] = pago.periodo.toStr_F();
	var fingr = pago.fingr.toStr_I();
	if (fingr) vgk.appEdit.fechas[2] = fingr;
	else vgk.appEdit.fechas[2] = 'Pdte';
	vgk.appEdit.showModal = true;

}

function addPago(){
	var pago = new Pago();
	console.log(JSON.stringify(pago));
	vgk.appEdit.showModal = false;
	vgk.appEdit.edit_t = "PAGO";
	vgk.appEdit.editON = false;
	vgk.appEdit.pago = pago;
	vgk.appEdit.showModal = true;
}

function borraPagos(){
	var pacto = vgk.appEdit.pacto;
	pacto.obj.pagos = [];
	vgk.pactos.updtNodoSelf(pacto);
	vgk.appPagos.pagos =[];
	vgk.appEditBig.showModal = false;
	// Update la lista en BD
	var _id = vgk._id;

	var url = vgk.urlServer+':'+vgk.portNode;
	var xhr = getXHR('PUT',url +'/api/DemoRooms/'+_id, ecoUpdtPactos);

//	var xhr = getXHR('PUT','http://reto-labs.es:3000/api/DemoRooms/'+_id,ecoUpdtPactos)
//	var xhr = getXHR('PUT','http://localhost:3000/api/DemoRooms/'+_id,ecoUpdtPactos)
	xhr.send(JSON.stringify(vgk.pactos.clase2ObjDB()));
}


/*
//------------------------------------------------------------------- Liquidación Fianza
Se suman los pagos de los 'otros' contratos, que intersectan con el periodo del contrato a liquidar.
Se suman los gastos que intersectan con el periodo del contrato a liquidar
La liquidación será la diferencia de la fianza y el saldo entre gastos y pagos en este periodo
Se ignora si los pagos de los 'otros' se han materializado o no.
No así con los del contrato a liquidar. Si hay pagos pendientes se computarán al final.
Se supone que tanto el árbol de Pagos del flat, como la lista de Pactos están ya cargados

liquidacFianza --> getPagosPiso (loop rooms.pactos_id) ===> ecoGetPagosPiso x n pactos

ecoGetPagosPiso ([+pagosOtros]) --> procesaPagos

procesaPagos (loop pagos el Pacto, loop pagosOtros, loop Rebuts flat)
	
*/
function procesaPagos(){
	console.log('Procesa pagos. Otros: ' + vgk.pagosOtros.length);
	var alqlr = vgk.elPacto.obj.precio;
	var fianz = vgk.elPacto.obj.fianza;
	var pagos = vgk.elPacto.obj.pagos;
	var durac = vgk.elPacto.obj.periodo;

	totalPagos = 0;
	pagos.map(function(pago){
		if (pago.tipo == 'ALQ')
			totalPagos += parseFloat(pago.euros - alqlr);
	})

	totalOtros = 0;
	vgk.pagosOtros.map(function(pagos){
		pagos.map(function(pago){
			var solape = intersLapsos(pago.periodo,durac);
			if (solape){
				var pct = (parseInt(solape.tau)/parseInt(pago.periodo.tau));
				totalOtros += parseFloat(pago.euros) * pct;
				}
			})

		})

	var gastos = vgk.rebuts.getRebuts(); // al ser rArbol, puede haber nodos adicionales para clasificar
	totalRebuts = 0;
	gastos.map(function(gasto){
		var solape = intersLapsos(gasto.obj.periodo,durac);
		if (solape){
			var pct = (parseInt(solape.tau)/parseInt(gasto.obj.periodo.tau));
			totalRebuts += parseFloat(gasto.obj.euros) * pct;
		}
	})



	var total = totalRebuts - (totalOtros + totalPagos);
	console.log('Rebuts: ' + totalRebuts+'Otros: ' + totalOtros+' Pagos: '+totalPagos+' Fianza a liq: '+total);
}

function ecoGetPagosPiso(xhr){
	var jsonTxt = xhr.responseText;
	if (jsonTxt.length > 10){
		var objDB = JSON.parse(jsonTxt);
		console.log('Cargada '+objDB.meta.tag);
		var pactos = objDB.nodos; // no es necesario convertir a Clase rLista
		pactos.map(function(pacto){
			console.log(pacto.tag);
			vgk.pagosOtros.push(pacto.obj.pagos);
		})
	}
	else { 
		console.log ('No hay lista de Contratos !!'); // Anomalía que no debe producirse en producción 
	}
	vgk.numPactos--;
	if (!vgk.numPactos) procesaPagos();
}


// Carga una lista de contratos por cada Room.
// Cada contrato lleva un array con los pagos, por hacer o confirmados
function getPagosPiso(){
	var flat = vgk.appEdit.flat;
	var roomIds = flat.hijos;
	console.log('Rooms Id:  '+o2s(roomIds));

// Ponemos un contador, para detectar cuando se han cargado todas las listas de Pactos
 // Se incrementa en 1 por cada lista a cargar, y se decrementa en 1 (en el eco) por cada lista cargada
 // Se salta la habitación actual

	vgk.numPactos = 0;
	var n = roomIds.length;
	for (var i=0;i<n;i++){
		var roomId = roomIds[i];
		var room = vgk.grupo.getNodoById(roomId);
		console.log('Rooms :  '+room.tag+':'+room.obj.pactos_id);

		if (room.id0 == vgk.appEdit.room.id0) { continue;} // Se salta la room activa

		var pactos_id = room.obj.pactos_id;
		if (pactos_id != 'NdN'){
			vgk.numPactos ++; 
			var url = vgk.urlServer+':'+vgk.portNode;
			var xhr = getXHR('GET',url +'/DemoRooms/'+pactos_id, ecoGetPagosPiso);
			xhr.send(null);
		}

	}
}

function liquidarFianza(id0){
	vgk.pagosOtros =  []; // Array de arrays de Pagos
	vgk.elPacto = vgk.pactos.getNodoById(id0); // Se guarda el contrato a liquidar
	getPagosPiso();
}

//=================================================================== Import CSV
//------------------------------------------------------------------- Indice BTree

function creaIndexBTree(){
	var raiz = new rNodoBT('Raiz'); 
	raiz.obj.tipo = 'RAIZ';

	var btree = new rBTree('BTree',[raiz],16);
	vgk.rebuts.nodos.map(function(nodo){
		if (nodo.iam == 'Gasto'){
			var clau = nodo.getClau();
			if (!btree.existe(clau)) btree.altaClave(clau);
			else console.log('Repe1: '+clau)
		}
	})
	return btree;
}

function importarMovs(){
	var btree = creaIndexBTree();
	var numImp = 0;
	var tipos = vgk.rebuts.getGastosT();
	var n = tipos.length;
	var lins = vgk.appImport.csv.split('\n')
	lins.map(function(lin){
		var items = lin.split('|');
		for (var i=0;i<n;i++){
			var tipo = tipos[i];
			if (items[0].match(tipo.obj.maskCSV)){
				var gasto = new Gasto(tipo.tag);
				gasto.obj.tipo = tipo.cod;
				gasto.obj.euros = items[2];
				gasto.obj.periodo = fechas2Lapso(items[1],items[1]);
				gasto.obj.cargo = fechas2Lapso(items[1],items[1]);

				var clau = gasto.getClau();
				if (!btree.existe(clau)){
					numImp++;
					btree.altaClave(clau);
					vgk.rebuts.addNodoGasto(gasto);
					}
				else console.log('Repe1: '+clau)
				};
		}
	})
	var ok = confirm('Importados '+numImp+' movimientos\nGrabar?');
	if (ok) updateRebuts();
}

//------------------------------------------------------------------- Pegar CSV Gastos/Pagos

function obtenerTextoEnComillas(txt) {
	const regex = /"([^"]*)"|'([^']*)'/g;
  var resultado = [];
	while ((grupo = regex.exec(txt)) !== null) {
		//si coincide con comillas dobles, el contenido estará en el
		//   grupo[1], con el grupo[2] undefined, y viceversa
		resultado.push(grupo[1] || grupo[2]);
    }
    
    //resultado es un array con todas las coincidencias
    // mostramos los valores separados con saltos de línea
    return resultado;
}

//------------------------------------------------------------------- Prepegado
// Se invoca al "paste" del clipboard(ctrl-V, etc)
// Se determina si proviene de html de la consulta online, o de un texto .csv
// Si no es de html, hay que extraer las cantidades de números con decimales, que llevan ','
// Estos números van entre comillas, y hay que cambiar las comas por puntos
// Entonces se hace el split(',')

function prePegado(e){
	var clipboardData, pastedData;

	// Stop data actually being pasted into div
	e.stopPropagation();
	e.preventDefault();

	// Get pasted data via clipboard API
	clipboardData = e.clipboardData || window.clipboardData;
	pastedData = clipboardData.getData('Text');
	// Do whatever with pasteddata
	var linsOK = [];
	var lineas = pastedData.split('\n');
	lineas.map(function(lin){
		var cols = null;
		var colsTab = lin.split('\t'); // si esta delimitado por \t es html
		var colsPyC = lin.split(';'); // si esta delimitado por ; es csv
		if (colsTab.length == 5 && colsPyP.length != 5) var cols = colsTab;
		else if (colsTab.length != 5 && colsPyC.length == 5) var cols = colsPyC;
		else if (colsTab.length != 5 && colsPyC.length != 5){  // CSV delimitado por comas
			linComillas = obtenerTextoEnComillas(lin);
			linComillas.map(function(numComa){
				var numPunt = numComa.replace(',','.');
				lin = lin.replace('"'+numComa+'"',numPunt);
			})
			colsComas = lin.split(',');
			if (colsComas.length == 5) cols = colsComas;
		} 

		if (cols){
			var colsOK = cols.splice(1,3);
			linsOK.push(colsOK.join('|'));
		}
	})
	var txt = linsOK.join('\n');
	vgk.appImport.actualiza(txt);
}
//=================================================================== Calendario Gastos

function showRebutsJar(){
	var tipos = vgk.rebuts.getGastosVue(2017);
	vgk.appCargosJar.jar = 2017;
	vgk.appCargosJar.tipos = tipos;
}

//===================================================================  Gastos en SQLite OLD !!!
//------------------------------------------------------------------- Carga Gastos BD sqlite
function ecoGastosSQLite(xhr){
	var lins = xhr.responseText.split('\n');
	var linErr = lins.splice(-2,1);
	if (linErr != '[error:0]') return false;
	var caps = (lins.splice(0,1)[0]).toLowerCase();

	var filas = [];
	lins.map(function(lin){
		var fila = csv2obj(caps,lin);
		if (fila) filas.push(fila);
	})
	creaArbolGastos(filas);
}

function getGastosSQLite(){
	var url = vgk.urlServer+':'+vgk.portNode;
	var xhr = getXHR('POST',url +'/shell/sqlite/', ecoGastosSQLite);

	var stmt = 'select fecha_op,concepto,importe from JAR_2017 ';
	stmt += 'where concepto like "R/%";'

	var stmtB64 = Base64.encode(stmt);

	xhr.send('{"id":1234567,"db":"Gastos_StPau.sqlite","path":"TallerRooms/sqlite","stmt":"'+ stmtB64 +'"}');

}

function ecoPagosSQLite(xhr){
	var lins = xhr.responseText.split('\n');
	var linErr = lins.splice(-2,1);
	if (linErr != '[error:0]') return false;
	var caps = (lins.splice(0,1)[0]).toLowerCase();

	var filas = [];
	lins.map(function(lin){
		var fila = csv2obj(caps,lin);
		if (fila) filas.push(fila);
	})
	creaArbolPagos(filas);
}

function getPagosSQLite(){
	var url = vgk.urlServer+':'+vgk.portNode;
	var xhr = getXHR('POST',url +'/shell/sqlite/', ecoPagosSQLite);
	
	var stmt = 'select fecha_op,concepto,importe from JAR_2017 ';
	stmt += 'where concepto like "TRANSF CTA DE:%";'

	var stmtB64 = Base64.encode(stmt);

	xhr.send('{"id":1234567,"db":"Gastos_StPau.sqlite","path":"TallerRooms/sqlite","stmt":"'+ stmtB64 +'"}');
}
