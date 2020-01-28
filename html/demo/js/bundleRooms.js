
class Usuario extends rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'Usuario';
		this.obj = {
			user : '',
			mail : '',
			clau : ''

		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}

}

// Un usario y un propietario se "ligan" mediante el _id del Grupo y el id0 del nodoOwner

//------------------------------------------------------------------- Persona

class Persona extends rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'Persona';
		this.obj = {
			nombre : '',
			apell : '',
			email : '',
			telef : ''

		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}

}

//------------------------------------------------------------------- Inquilino
class Inquilino extends Persona {
	constructor(tag){
		super(tag);
		this.iam = 'Inquilino';
		this.obj.genero = 'Sr';
		this.obj.pais = '';
		this.obj.direcc = '';
		this.obj.idCard = 'NIF ';
		this.obj.centro = '';
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = 'Inquilino';
		this.obj = objDB.obj;
	}
}




// rooms_FSM.js

/* La "Máquina de Estados Finita", FSM (del inglés "Finite State Machine"),
 ó "Automata" para Rooms, modeliza las fases de un contrato de alquiler de una habitación
 y el estado de dicha habitación

Bloqueado  (BLOK) Contrato especial "de Bloqueo". Impide nuevas reservas

El Automata tiene los siguientes estados(Nodos_FSM)
	Room:
		Disponible (FREE)
		Pendiente  (STBY)
		Alquilado  (RENT)

		Bloqueado  (BLOK)

	Pacto:
		Nuevo      (_NEW)
		Propuesto  (ENQR)
		Rechazado  (DENY)
		Reservado  (BOOK)
		Expirado   (LATE)
		Pendiente  (STBY)
		Alquilado  (RENT)
		Terminado  (_END)
		Cancelado  (CANC)



	Y las transiciones (Arcos_FSM):

	Rsva -------> Transicion -----> Rsva / Room
	_NEW --> Proponer (ENQUIRY) --> ENQR / STBY : Nuevo contrato
	ENQR --> Denegado (DECLINE) --> DENY / FREE : Propietario no acepta la petición de reserva
	ENQR --> Aceptado (ACCEPTD) --> BOOK / STBY : Propietario acepta la petición de reserva
	BOOK --> Expirado (EXPIRED) --> LATE / FREE : Inquilino no ha confirmado en 48 horas
	BOOK --> Confirma (CONFIRM) --> STBY / STBY : Inquilino ha confirmado (transferencia)
	STBY --> Contrato (CHECKIN) --> RENT / RENT : Inquilino firma contrato y entra al piso
	STBY --> Problema (PROBLEM) --> PROB / FREE : Inquilino no contrata, por algún problema
	RENT --> Checkout (CHEKOUT) --> _END / FREE : Inquilino marcha, y se liquida la fianza.
	RENT --> Cancelar (CANCEL2) --> CANC / FREE : Inquilino marcha antes de lo pactado.

*/

class Nodo_FSM extends rNodo{
	constructor(tag,cod){
		super(tag);
		this.iam = 'Nodo_FSM';
		this.cod = cod;
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = 'Nodo_FSM';
		this.cod = objDb.cod;
	}
}

class Arco_FSM extends rArco{
	constructor(nodo0,nodo1,tag,cod){
		super(nodo0,nodo1);
		this.tag = tag;
		this.iam = 'Arco_FSM';
		this.cod = cod;
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = 'Arco_FSM';
		this.cod = objDB.cod;
	}
}

class Automata extends rGrafo {
	constructor(nombre,nodos,arcos){
		super(nombre,nodos,arcos);
		this.iam = 'Automata';

		this.state = ''; // es un Nodo_FSM
		this.indexStat = [];
		this.indexTran = [];

		this.optimizaStatTrans();
	}

	optimizaStatTrans(){
		this.nodos.map(function(stat){
			this.indexStat.push(stat.cod)
		}.bind(this))

		this.arcos.map(function(trans){
			this.indexTran.push(trans.cod)
		}.bind(this))
	}

// No necesario, porque no se guarda en BD (de momento)
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = 'Automata';
	}

	setState(codStat){
		var ixStat = this.indexStat.indexOf(codStat);
		if (ixStat == -1){alert('Codigo Estado erróneo'); return false;}
		this.state = this.nodos[ixStat];
	}

	getState(){
		return this.state;
	}

	setTransic(codTran){
		var ixTran = this.indexTran.indexOf(codTran);
		if (ixTran == -1){alert('Codigo Transición erróneo'); return false;}
		var trans = this.arcos[ixTran]
		if (trans.id0 == this.state.id0){
			this.state = this.getNodoById(trans.id1);
		}
		else (alert('Transición errónea'));
	}

	getTransOK(){
		var transOK = [];
		this.arcos.map(function(arco){
			if (arco.id0 == this.state.id0) transOK.push(arco);
		}.bind(this))
		return transOK;
	}
}

function creaFSM_Rooms(){

	var nodos = [];
	var _new = new Nodo_FSM('Nuevo','_NEW');			nodos.push(_new); 
	var enqr = new Nodo_FSM('Propuesto', 'ENQR');	nodos.push(enqr);
	var deny = new Nodo_FSM('Denegado ', 'DENY');	nodos.push(deny);
	var book = new Nodo_FSM('Reservado', 'BOOK');	nodos.push(book);
	var late = new Nodo_FSM('Expirado ', 'LATE');	nodos.push(late);
	var stby = new Nodo_FSM('Pendiente', 'STBY');	nodos.push(stby);
	var prob = new Nodo_FSM('Problemas', 'PROB');	nodos.push(prob); 
	var rent = new Nodo_FSM('Alquilado', 'RENT');	nodos.push(rent);
	var canc = new Nodo_FSM('Cancelado', 'CANC');	nodos.push(canc);
	var _end = new Nodo_FSM('Terminado', '_END');	nodos.push(_end);

	var arcos = [];
	var propsta = new Arco_FSM(_new,enqr,'Proponer','ENQUIRY'); arcos.push(propsta);  // Se realiza peticion reserva
	var rechaza = new Arco_FSM(enqr,deny,'Rechazar','REFUSED'); arcos.push(rechaza);  // Propietario rechaza petición
	var reserva = new Arco_FSM(enqr,book,'Reservar','BOOKING'); arcos.push(reserva);  // Propietario acepta reserva
	var toolate = new Arco_FSM(book,late,'Expirado','EXPIRED'); arcos.push(toolate);  // Expira plazo 48 horas. Se libera habitación
	var confirm = new Arco_FSM(book,stby,'Confirma','CONFIRM');	arcos.push(confirm);  // Inquilino confirma (transferencia)
	var problem = new Arco_FSM(stby,prob,'Problema','PROBLEM'); arcos.push(problem);  // Inquilino no firma contrato por alguna causa
	var contrat = new Arco_FSM(stby,rent,'Contrata','CHECKIN'); arcos.push(contrat);  // Inquilino firma contrato y entra al piso
	var termina = new Arco_FSM(rent,_end,'Checkout','CHEKOUT'); arcos.push(termina);  // Termina contrato. Se libera habitación
	var cancela = new Arco_FSM(rent,canc,'Cancelar','CANCELA');	arcos.push(cancela);  // Inquilino marcha antes del fin del contrato.

	var fsm = new Automata('Rooms FSM',nodos,arcos);
	return fsm;
	}
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
		var cols = lin.split('\t'); // si esta delimitado por \t es html
		if (cols.length != 5){
			console.log('1:'+ lin);
			linComillas = obtenerTextoEnComillas(lin);
			linComillas.map(function(numComa){
				var numPunt = numComa.replace(',','.');
				lin = lin.replace('"'+numComa+'"',numPunt);
			})
			console.log('2:'+ lin);
			cols = lin.split(',');
		} 
		var colsOK = cols.splice(1,3);
		linsOK.push(colsOK.join('|'));

	})
	var txt = linsOK.join('\n');
	alert(txt);
	vgk.appImport.actualiza(txt);
}
function importarMovs(){
	alert(vgk.appImport.csv);
}// rooms_Random.js

function getRndCodResa(){
	var codResa = ("0000" + Math.round(Math.random()*10000)).slice(-4);
	return codResa;
}

function getM2Room(){
	return Math.round(Math.random()*10) + 10; // Entre 10 y 20 m2
}

function getPrecioRoom(){
	var precio = Math.round(Math.random()*250) + 250; // Entre 250 y 500 euros, de 25 en 25
	return Math.floor(precio/25) * 25;
}

function getGastosRoom(){
	var gastos = Math.round(Math.random()*50) + 50; // Entre 50 y 100 euros, de 5 en 5
	return Math.floor(gastos/5) * 5;
}

function getRndDatosPersona(pct){
	var datos = {};
	datos.nombre = rInitCap(vgk.rnd.getRndUnNombre(pct)) ,
	datos.apell = rInitCap(vgk.rnd.getRndApellidos()),
	datos.email = vgk.rnd.getRndMail(datos.nombre,datos.apell),
	datos.telef = vgk.rnd.getRndTelef();
	return datos;
}

function getRndTag(obj){
	return obj.nombre;
}

//===================================================================

class rndPersona extends rNodo {
	constructor(pct){
		super('x');
		this.iam = 'Persona';
		this.obj = getRndDatosPersona(pct);
		this.tag = getRndTag(this.obj);
	}
}

class rndPropietario extends rndPersona {
	constructor(pct){
		super(pct);
		this.iam = 'Propietario';
		this.obj.codOwner = getRndCodResa();
		this.obj.codIBAN = vgk.rnd.getRndIban();
	}
}

class rndEmpleado extends rndPersona {
	constructor(pct){
		super(pct);
		this.iam = 'Empleado';
		this.obj = {
			codStaff : getRndCodResa()
		}
	}
}

class rndInquilino extends rndPersona {
	constructor(tag){
		super(tag);
		this.iam = 'Inquilino';
		this.obj.genero = 'Sr';
		this.obj.pais = '';
		this.obj.direcc = '';
		this.obj.idCard = 'NIF ';
		this.obj.centro = '';
		this.setCampos();
	}

	setCampos(){
		var pais = vgk.rnd.getEurPais();
		this.obj.pais = pais._k;
		this.obj.direcc = pais._c +'('+pais._p+')';
		console.log(o2s(this.obj));
	}
}

class rndPiso extends rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'Piso';
		this.obj = {
			codFlat : getRndCodResa(),
			direcc : '',
			cpostal: '',
			poblac : 'Barcelona',
			prov : 'Barcelona',
			gastos_id : 'NdN', // Lista de gastos. Se crea al addGasto por primera vez
			stock_id : 'NdN', // stock (inventario) del piso. se crea cuando se invoca stocks.html
			state : [], 
			geo : '',
			strDirecc : vgk.rnd.getRndViasCP()
		}
		this.setCampos();

	}

	setCampos(){
		var calle = this.obj.strDirecc._c;

		calle = calle.replace('Travessera De','Trav.');
		calle = calle.replace('Avinguda','Av.');
		calle = calle.replace('Gran Via De Les Corts Catalanes','GV Corts Cat.');

		var num   = this.obj.strDirecc._n;
		var piso = this.obj.strDirecc._p;
		this.obj.cpostal =this.obj.strDirecc._k;
		this.obj.direcc = calle +', '+num+' '+piso;


		this.tag = calle+'-'+num;
	}
}

class rndHabitacion extends rNodo {
	constructor(tag,n){
		super(tag);
		this.iam = 'Habitacion';
		this.obj = {
			codRoom : n,
			m2: getM2Room(),
			precio : getPrecioRoom(),
			gastos : getGastosRoom(),
			state : {tag:'Disponible', cod:'FREE'},
			pactos_id : 'NdN', // _id Lista de contratos
			pacto_id0 : 0, // id0 contrato en vigor
			blokeo_id0: 0, // id0 si
		}

	}
}

class rndReserva extends rNodo {
	constructor(tag,precio,gastos){
		super(tag);
		this.iam = 'Reserva';
		this.obj = {
			grupo_id : '',
			room_id0 :'',
			state :{tag:'Nuevo',cod:'_NEW'},
			precio : precio,
			gastos : gastos,
			fianza : precio * 2,
			roomer : new rndInquilino(tag),
			periodo : fechas2Lapso('1/10/2017','31/1/2018'),
			checkIO : fechas2Lapso('1/10/2017','31/1/2018'),
			notas : '',
			pagos: []
		}
		this.tag =this.obj.roomer.obj.nombre;
	}
	setState(nodo){
		this.obj.state.tag = nodo.tag;
		this.obj.state.cod = nodo.cod;
	}

}

function genRndGrupo(nombre){
	var amo, piso;

  var raiz = new rNodo(nombre);
  var grupo = new rArbol(nombre,[raiz]);

	for (var i=0;i<num;i++){
		amo = new rndPropietario(50);
		grupo.addNodoHijo(raiz,amo);
		piso = new rndPiso('Piso de '+ amo.tag);
		grupo.addNodoHijo(amo,piso);
	}
}

function initRndRooms(){
	initRND(); // en libK1_Random.js
}function ecoCreaUsuario(xhr){
	if (xhr.responseText.match('error:0')) alert('Usuario grabado')
	else alert('Algo ha ido mal');
}

function ecoUpdtUsuario(xhr){
	if (xhr.responseText.match('error:0')) alert('Usuario actualizado')
	else alert('Algo ha ido mal');
}

function ecoGetMD5_UsrOwner(xhr){
	vgk.appEdit.showModal = false;
	var user = vgk.usrOwner;
	var md5 = xhr.responseText.substr(0,32);
	if (vgk.appEdit.editON){
		var stmt = 'update users set';
		stmt += ' usr="'+ user.usr+'",';
		stmt += ' org="'+ user.org+'",';
		stmt += ' md5="'+md5+'"';
		stmt += ' where _id="'+user._id+'" and id0='+user.id0+';';
		grabaUsuario(stmt,ecoUpdtUsuario)
	}
	else {
		var stmt = 'insert into users (_id,id0,usr,md5,rol,org) ';
		stmt += 'values ("'+user._id+'",'+user.id0+',"'+user.usr+'","'+md5+'","'+user.rol+'","'+user.org+'");'
		grabaUsuario(stmt,ecoCreaUsuario)
	}
}

function cambiaPwdUser(){
	var usr = vgk.user;
	usr.pwd = "";
	usr.conf = "";
	vgk.appEdit.user = usr;
	vgk.appEdit.edit_t = "USER";
	vgk.appEdit.showModal = true;
	vgk.appEdit.editON = true;
}

function grabaNuevoUser(){
	var user = vgk.appEdit.user;
	if (user.pwd != user.conf){ alert('El password y la confirmación no coinciden'); return false;}
	vgk.usrOwner = user;	
	getMD5(user.usr,user.pwd,ecoGetMD5_UsrOwner);
}


function actualizaAppEditUsr(usr,editON){
	alert(vgk.appEdit.showModal);
	vgk.appEdit.user = usr;
	vgk.appEdit.edit_t = "USER";
	vgk.appEdit.showModal = true;
	vgk.appEdit.editON = editON;
}

//------------------------------------------------------------------- Usuario Roomer

function creaUsrRoomer(){
	var pacto = vgk.pactos.getNodoById(vgk.pacto_id0);
	var user = {
		_id : vgk.pactos_id,
		id0 : vgk.pacto_id0,
		usr : pacto.tag.toLowerCase(),
		pwd : '',
		conf : '',
		rol : 'ROOMER',
		org : vgk.user.org  // del usuario "OWNER" que hizo Login
	}
	actualizaAppEditUsr(user,false);
}
function ecoGetUsrRoomer(xhr){
	var filas = csv2filas(xhr.responseText);
	if (filas.length == 0){
		var ok = confirm('No existe usuario.\n Crearlo?');
		if (ok) creaUsrRoomer();
		return false;
	}
	var usrRoomer = filas[0];
	usrRoomer.pwd = "";
	usrRoomer.conf = "";
	actualizaAppEditUsr(usrRoomer,true);
}

function editUsrRoomer(id0){
	vgk.pacto_id0 = id0;
	var stmt = 'select _id,id0,usr,rol,org from users where _id="'+vgk.pactos_id+'" and id0='+id0+';';
	getUsuario(stmt,ecoGetUsrRoomer);
}

//------------------------------------------------------------------- Usuario Owner

function creaUsrOwner(){
	var owner = vgk.grupo.getNodoById(vgk.owner_id0);
	var user = {
		_id : vgk.grupo_id,
		id0 : vgk.owner_id0,
		usr : owner.tag.toLowerCase(),
		pwd : '',
		conf : '',
		rol : 'OWNER',
		org : vgk.user.org  // del usuario "STAFF" que hizo Login
	}
	actualizaAppEditUsr(user,false);
}

function ecoGetUsrOwner(xhr){
	var filas = csv2filas(xhr.responseText);
	if (!filas) return false;
	if (filas.length == 0){
		var ok = confirm('No existe usuario.\n Crearlo?');
		if (ok) creaUsrOwner();
		return false;
	}
	var usrOwner = filas[0];
	usrOwner.pwd = "";
	usrOwner.conf = "";
	actualizaAppEditUsr(usrOwner,true);
}
function editUsrOwner(id0){
	vgk.owner_id0 = id0;
	var stmt = 'select _id,id0,usr,rol,org from users where _id="'+vgk.grupo_id+'" and id0='+id0+';';
	getUsuario(stmt,ecoGetUsrOwner);
}
//------------------------------------------------------------------- Usuario Staff

function creaUsrClerk(){
	var clerk = vgk.staff.getNodoById(vgk.clerk_id0);
	var user = {
		_id : vgk.staff_id,
		id0 : vgk.clerk_id0,
		usr : clerk.tag.toLowerCase(),
		pwd : '',
		conf : '',
		rol : 'CLERK',
		org : vgk.user.org  // del usuario "ADMIN" que hizo Login
	}
	actualizaAppEditUsr(user,false);
}

function ecoGetUsrClerk(xhr){
	var filas = csv2filas(xhr.responseText);
	if (!filas) return false;
	if (filas.length == 0){
		var ok = confirm('No existe usuario.\n Crearlo?');
		if (ok) creaUsrClerk();
		return false;
	}
	var usrClerk = filas[0];
	usrClerk.pwd = "";
	usrClerk.conf = "";
	actualizaAppEditUsr(usrClerk,true);
}
function editUsrClerk(id0){
	vgk.clerk_id0 = id0;
	var stmt = 'select _id,id0,usr,rol,org from users where _id="'+vgk.staff_id+'" and id0='+id0+';';
	getUsuario(stmt,ecoGetUsrClerk);
}

// Funciones de vueApps comunes a la aplicación RETO/Rooms

function initModal(){
	if (r$('modal-template')){
		alert('initModal');
		Vue.component('modal', {
			template: '#modal-template'
		})
	}	
	if (r$('modal-template-big')){
		Vue.component('modal-big', {
			template: '#modal-template-big'
		})
	}

	if (r$('appEdit')){
		vgk.appEdit = new Vue({
			el: '#appEdit',
			data: { 
				showModal: false,
				editON : false,
				edit_t : '', //CLERK|GRUPO|OWNER|FLAT|ROOM|
				ix : '',
				opciones : [],
				valorSel : '',
				valores : [],
				chkValor : true,
				grupo:'', // string nombre del grupo
				user:{},
				clerk:{},
				owner:{},
				piso:{},
				room:{},
				fechas:[],
				gasto_t:[],
			},
			methods : {
				cambiaVista : function(ev){alert(this.valores.join('|'));}, // select multiple Vista
				chkClick : function(ev){this.chkValor = !this.chkValor;}, //  mostrar/oculto en form edit Gasto_t
				handleChange : function(ev){this.valorSel = ev.target.value;}, // Select states
				resetRoom : function(id0){resetRoom(id0)}, // en pkg_Rooms.js
				resetFlat : function(id0){resetFlat(id0)} // en pkg_Flats.js
	
			}
		})
	}

	if (r$('appEditBig')){
		vgk.appEditBig = new Vue({
			el: '#appEditBig',
			data: { 
				showModal: false,
				editON : false,
				edit_t : '',
				grupo : '',
				rebuts : '',
				ix : '',
				pacto:{},
				fechas:[]
			},
			methods : {
				editGastoT : function(id0,ix){editGastoT(id0,ix)}, // en pkg_Flats.js
				refreshRebuts : function(gasto_t,ix){
					Vue.set(this.rebuts, ix, gasto_t);
				}
			}
		})
	}
}



function initApps(){
	initModal();

	if (r$('solapas')){
		vgk.appTabs = new Vue({
			el: "#solapas",
			data:{
		    activeTab: 1
		  }
		})
	}

	if (r$('appModo')){
		vgk.appModo = new Vue({
			el: '#appModo',
			data: { 
				random: false
			},
			methods : {
				toggle : function(){this.random = !this.random;}
			}
		})
	}
}

function resetApps(){
}var vgApp = {
	paramsXHR : {
		url : 'http://' + window.location.hostname,
		port : 3000,
		base : '/demoRooms',
		iam : '',
		eco : null
	},
	sqlite : {
		base   : '/shell/sqlite',
		userDB : 'usersDemo.sqlite',
		sessDB : 'sessDemo.sqlite',
		pathDB : 'apps/Rooms/sqlite/demo',
		stmtDB : '',
	},
	encript : {
		base   : '/shell/encript',
	}
}

class FAQ extends rArbol {
	constructor(tag,nodos){
		super(tag,nodos);
		this.meta.iam = 'FAQ';
	}

	nodo2vue(nodo,vueObj){
		vueObj.id0 = nodo.id0;
		vueObj.tag = nodo.tag;
		vueObj.iam = nodo.iam;
		if (nodo.iam == 'Item' && nodo.obj.descrip.length>0) vueObj.descrip = '('+nodo.obj.descrip+')';
		vueObj.hijos = [];
		var n = nodo.hijos.length;
		if (!n) return;
		for (var i=0;i<n;i++){
			var nodoH = this.getNodoById(nodo.hijos[i]);
			var vueH = {};
			this.nodo2vue(nodoH,vueH);
			vueObj.hijos.push(vueH);
		}
	}

	reto2vue(){
		var vueObj = {};
		var raiz = this.nodos[0];
		this.nodo2vue(raiz,vueObj);
		return vueObj;
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.meta.iam = objDB.meta.iam;
	}

}

function initAppsFAQ(){
	vgk.dataFAQ = {};

// define the item component
	vgk.itemFAQ = Vue.component('item', {
		template: '#item-template',
		props: {
			model: Object
		},
		data: function () {
			return {
				open: false
			}
		},
		computed: {
			isFolder: function () {
				return this.model.hijos && this.model.hijos.length;
			}
		},
		methods: {
			toggle: function () {
				if (this.isFolder) this.open = !this.open;
			},
			changeType: function () {
				if (!this.isFolder) {
					Vue.set(this.model, 'hijos', []);
						this.addChild();
						this.open = true;
					}
				},
			addChild: function () {
				addNuevoItem(this.model.id0);
			},
			editItem: function () {
				editItem(this.model);
			}
		} // methods
	}) // Vue.component

// boot up the demo
vgk.appFAQ = new Vue({
	el: '#FAQ',
		data: {
			treeData: vgk.dataFAQ
		},
	methods : {
		actualiza : function(FAQ){this.treeData = FAQ}
	}
})

} // function

//===================================================================	Show/Edit FAQ (Inventario)

function showFAQVue(){
	var vueFAQ = vgk.FAQ.reto2vue();
	vgk.appFAQ.actualiza(vueFAQ);
}
//------------------------------------------------------------------- Crear FAQ / Propietario

function addNuevoItem(id0){
	var item = new Item('Nuevo');
	var padre = vgk.FAQ.getNodoById(id0);
	vgk.FAQ.addNodoHijo(padre,item);
	showFAQVue(vgk.FAQ);
	updateFAQ();
}

function grabaNuevoItem(){
	var item = vgk.appEdit.item;

	if (vgk.appEdit.editON) vgk.FAQ.updtNodoSelf(item);
	else{ 
		alert('No es Edit??');
	}
	showFAQVue(vgk.FAQ);
	updateFAQ();
	vgk.appEdit.showModal = false;

}

function addNuevoHijo(){
	var item = vgk.appEdit.item;

	if (vgk.appEdit.editON){
		var nuevo = new Item('Nuevo');
		vgk.FAQ.addNodoHijo(item,nuevo);
	}
	else{ 
		alert('No es Edit??');
	}
	showFAQVue(vgk.FAQ);
	updateFAQ();
	vgk.appEdit.showModal = false;

}

function editItem(model){
	var item = vgk.FAQ.getNodoById(model.id0);
	vgk.appEdit.item = item;
	vgk.appEdit.edit_t = "ITEM";
	vgk.appEdit.editON = true;
	vgk.appEdit.showModal = true;
}

//------------------------------------------------------------------- CRUD FAQs MongoDB
function ecoGrabaFAQ(xhr){
	var resp = JSON.parse(xhr.responseText);
	vgk.FAQ_id = resp._id;

	if (!vgk.piso.obj.FAQ_id || vgk.piso.obj.FAQ_id == 'NdN'){
		vgk.piso.obj.FAQ_id = resp._id;
		vgk.grupo.updtNodoSelf(vgk.piso);
		console.log('ya! '+ o2s(vgk.piso));
		updateGrupo();
	}
	console.log ('Grabado nuevo FAQ: ' + resp._id);
	return false;
}

function grabaNuevoFAQ(piso){
	var raiz = new rNodo(piso.tag);
	vgk.FAQ = new FAQ('FAQ_'+piso.obj.codPiso,[raiz]);
	showFAQVue();
	vgk.FAQ.meta.org = vgk.user.org;

	var params = vgApp.paramsXHR;
	params.base = '/demoRooms/';
	params.eco = ecoGrabaFAQ; 
	params.iam = 'FAQ';
	params.txt = o2s(vgk.FAQ.clase2ObjDB());
	ajaxPostTopol(params);

	vgk.appEdit.showModal = false;
}



function ecoUpdateFAQ(xhr){
	var resp = JSON.parse(xhr.responseText);
	console.log('Actualizado FAQ: ' + resp._id);
	return false;
}

function updateFAQ(){
	if (vgk.FAQ.meta.org != vgk.user.org){
		alert('FAQ sin ORG:' + vgk.FAQ.meta.org +':'+ vgk.user.org);
		vgk.FAQ.meta.org = vgk.user.org;
	};

	var params = vgApp.paramsXHR;
	params.base = '/demoRooms/';
	params.eco = ecoUpdateFAQ;
	params.txt = o2s(vgk.FAQ.clase2ObjDB());
	params.topolId = vgk.FAQ_id;
	ajaxPutTopol(params);
	return false;
}

//------------------------------------------------------------------- Pick FAQ
function ecoGetUnFAQ(xhr){
		var respTxt = xhr.responseText;
		vgk.loTopol = JSON.parse(respTxt);
		vgk.FAQ_id = vgk.loTopol._id;
		vgk.FAQ = new FAQ("",[]);
		vgk.FAQ.objDB2Clase(vgk.loTopol);

		vgk.postGetUnFAQ();
}

function getUnFAQ(_id){
	vgk.FAQ_id = _id;
	var params = vgApp.paramsXHR;
	params.base = '/demoRooms/';
	params.eco = ecoGetUnFAQ;
	params.topolId = _id;

	ajaxGet1Topol(params);

	return false;
}

// pkg_Flats.js
//------------------------------------------------------------------- Flats
// obj.state: Estado de las habitaciones. Representa el valor por cada habitación
// Ej (para 4 habitaciones):['LIBRE','BOOKED','LIBRE','RENTED'] 
class Piso extends rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'Flat';
		this.obj = {
			codFlat : '',
			direcc : '',
			cpostal: '',
			poblac : '',
			prov : '',
			gastos_id : 'NdN', // Gastos (Gastos). Se crea al addGasto por primera vez
			stock_id : 'NdN', // Stock (Inventario) del piso. se crea cuando se invoca stocks.html
			faqs_id : 'NdN', // FAQs (Información) del piso. se crea cuando se invoca faqs.html
			state : [], // no usado de momento
			geo : '', // coordenadas GPS/UTM etc. No usado de momento
			strDirecc : '' // para geocodificación 
		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}

}


function initAppFlats(){

	if (r$('lstFlats')){
		vgk.appListaFlats = new Vue({
			el: '#lstFlats',
			data: {lista: []},
			methods : {
				actualiza : function(items){this.lista = items},
				cargaFlat: function(_id,id0){ cargaGrupoFlat(_id,id0);},
			}
			}) 
	}
	if(r$('h3Flats')){
		vgk.appH3Flats = new Vue ({
			el: '#h3Flats',
			data : {owner : 'Ninguno'},
			methods : {
				creaNuevoFlat : function(){creaNuevoFlat();},
				limpia : function(){this.owner = 'Ninguno';},
				actualiza : function(owner){this.owner = owner;}
			}
		})
	}
	
	if(r$('divFlats')){
		vgk.appFlats = new Vue({
			el: '#divFlats',
			data : {flats : []},
			methods :{
				limpia : function(){
					this.flats = [];
					vgk.appRooms.limpia();
				},
				editStock : function(id0){goInventario(id0);},
				editFAQs : function(id0){goInformacion(id0);},
				addGasto : function(id0){creaGasto(id0);},
				addRoom :function(id0){addRoom(id0)},
				showRooms :function(id0){showRooms(id0)},
				showGastos:function(id0){showGastos(id0)},  // en pkg_Money.js
				borraRebuts:function(id0){borraRebuts(id0)},  // en pkg_Money.js
				actualiza : function(flats){
					this.flats = flats;
					if (flats.length){
						this.showRooms(flats[0].id0);
						if (vgk.appH3Gastos){
							vgk.appH3Gastos.actualiza(flats[0].tag);
							this.showGastos(flats[0].id0);
							
						}
						if (vgk.appH3Import) vgk.appH3Import.actualiza(vgk.appH3Rooms.flat);
					}
					else {
						vgk.appRooms.limpia();
					}
				},
				editFlat: function(id0){
					var flat = vgk.grupo.getNodoById(id0);
					vgk.appEdit.flat = flat;
					vgk.appEdit.edit_t = 'FLAT';
					vgk.appEdit.showModal = true;
					vgk.appEdit.editON = true;
				},
				operacFlat : function(id0){
					var idSess = vgk.params.idSess;
					window.location='operacRooms.html?idSess='+idSess+'::'+vgk.grupo_id+'::'+id0;
				}
			}
		})
	}	
}
//------------------------------------------------------------------- Reset Flat
function resetFlat(){
	var flat = vgk.appEdit.flat;
	borraRebuts(flat.obj.gastos_id); // en pkg_Money.js
	flat.obj.gastos_id = 'NdN';
	vgk.grupo.updtNodoSelf(flat);
	updateGrupo();
	vgk.appGastos.actualiza([]);
	vgk.appEdit.showModal = false;
}

//------------------------------------------------------------------- Flats
function renderFlats(id){
		var owner = vgk.grupo.getNodoById(id);
		vgk.appH3Flats.actualiza(owner.tag);
		vgk.appEdit.owner = owner;
		var losFlats = [];
		owner.hijos.map(function(idH){
			var flat = vgk.grupo.getNodoById(idH);
			losFlats.push(flat);
		})
		if (vgk.appFlats){vgk.appFlats.actualiza(losFlats)}
		else{
			alert('appFlats no inicializada');
		}
}


function grabaNuevoFlat(){
	var flat = vgk.appEdit.flat;

	if (vgk.appEdit.editON) vgk.grupo.updtNodoSelf(flat);
	else{ 
		var owner = vgk.appEdit.owner;
		vgk.grupo.addNodoHijo(owner,flat);
		vgk.appFlats.flats.push(flat);
	}

	updateGrupo();
	vgk.appEdit.showModal = false;
}

function creaNuevoFlat(){
	vgk.appEdit.showModal = false;
	vgk.appEdit.edit_t = "FLAT";
	vgk.appEdit.editON = false;
	if (vgk.appModo.random) vgk.appEdit.flat = new rndPiso();
	else vgk.appEdit.flat = new Piso();
	vgk.appEdit.showModal = true;
}

//------------------------------------------------------------------- Grupos
class Grupo extends rArbol {
	constructor(tag,nodos){
		super(tag,nodos);
		this.meta.iam = 'Grupo';
		this.meta.org = '';
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.meta.iam = 'Grupo';
		this.meta.org = objDB.meta.org;
	}
}

function initAppGrupo(){
	if (r$('lstGrupos')){
		vgk.appListaGrupos = new Vue({
			el: '#lstGrupos',
			data: {lista: []},
			methods :{
				nuevoGrupo: function(_id){ creaNuevoGrupo();},
				borraGrupo: function(_id){ borraUnGrupo(_id);},
				getUnGrupo: function(_id){ getUnGrupo(_id);},
				actualiza : function(items){this.lista = items},
			}
		}) 
	}
}

function ecoBorraGrupo(xhr){
	console.log('Eco Borra Grupo: ' + xhr.responseText);
}
function borraUnGrupo(_id){
	alert('Borra: ' + _id);
	var params = vgApp.paramsXHR;
	params.base = '/demoRooms/';
	params.eco = ecoBorraGrupo;
	params.topolId = _id;
	ajaxDeleteTopol(params);
	return false;
}

function ecoUpdateGrupo(xhr){
	console.log('Eco Updt Grupo: ');
}
function updateGrupo(){
	if (vgk.grupo.meta.org != vgk.user.org){
		alert('Grupo sin ORG:' + vgk.grupo.meta.org +':'+ vgk.user.org);
		vgk.grupo.meta.org = vgk.user.org;
	};

	var params = vgApp.paramsXHR;
	params.base = '/demoRooms/';
	params.eco = ecoUpdateGrupo;
	params.txt = o2s(vgk.grupo.clase2ObjDB());
	params.topolId = vgk.grupo_id;
	ajaxPutTopol(params);
	return false;
}

function ecoGetUnGrupo(xhr){
		var respTxt = xhr.responseText;
		vgk.loTopol = JSON.parse(respTxt);
		vgk.grupo_id = vgk.loTopol._id;
		vgk.grupo = new Grupo("",[]);
		vgk.grupo.objDB2Clase(vgk.loTopol);

		vgk.postGetUnGrupo();
}

function getUnGrupo(_id){
	vgk.grupo_id = _id;
	var params = vgApp.paramsXHR;
	params.base = '/demoRooms/';
	params.eco = ecoGetUnGrupo;
	params.topolId = _id;

	ajaxGet1Topol(params);

	return false;
}


//-------------------------------------------------------------------Carga Grupo x Owner

function getGrupoByOwner(_id,id0){
	vgk.owner_id0 = id0;
	vgk.grupo_id = _id;
	getUnGrupo(_id);
}


function ecoGetGrupos(xhr){
	var respTxt = xhr.responseText;
	var objs = JSON.parse(respTxt);
	var items = [];
	objs.map(function(obj){
		if (obj.meta.org == vgk.user.org && obj.meta.iam == 'Grupo') items.push(obj);
	})
	vgk.appListaGrupos.actualiza(items);
	if (items.length > 0) getUnGrupo(items[0]._id);
}

function ajaxGetGrupos() {

	var params = vgApp.paramsXHR;
	params.base = '/metas/';
	params.eco = ecoGetGrupos;
	params.iam = 'Grupo';

	ajaxGetMetas(params);
 }


function ecoNuevo(xhr){
	ajaxGetGrupos();
}

function grabaNuevoGrupo(){
	var nombre = vgk.appEdit.grupo;
	if (!nombre) nombre = 'Grupo propietarios';
	var raiz = new rNodo(nombre);
	vgk.grupo = new Grupo(nombre,[raiz]);
	vgk.grupo.meta.org = vgk.user.org;

	var params = vgApp.paramsXHR;
	params.base = '/demoRooms/';
	params.eco = ecoNuevo; 
	params.iam = 'Grupo';
	params.txt = o2s(vgk.grupo.clase2ObjDB());
	ajaxPostTopol(params);

	vgk.appEdit.showModal = false;
}


//------------------------------------------------------------------- Grupos
// On submit, llama a grabaNuevoGrupo, en rooms_Ajax.js

function creaNuevoGrupo(){
	console.log('creaNuevoGrupo');
	vgk.appEdit.edit_t = "GRUPO";
	vgk.appEdit.grupo = "";
	vgk.appEdit.showModal = true;
}

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
		console.log(o2s(vista));

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
						console.log(tipos[i].cod)
						tipos[i].cargos[mes-1] = gasto.obj.euros;
					}
				}
			};
		})

		console.log(o2s(tipos));


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
		params.base = '/demoRooms/';
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
	params.base = '/demoRooms/';
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
	alert(cod);
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
	params.base = '/demoRooms/';
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
	params.base = '/demoRooms/';
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
//pkg_Owner.js
//------------------------------------------------------------------- Propietarios

class Propietario extends Persona {
	constructor(tag){
		super(tag);
		this.iam = 'Propietario';
		this.obj.codOwner = '',
		this.obj.codIBAN = ''
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}
}
function initAppOwner(){
	
	if(r$('lstOwners')){
		vgk.appListaOwners = new Vue({
			el: '#lstOwners',
			data: {lista: []},
			methods : {
				actualiza : function(items){this.lista = items},
				cargaOwner: function(_id,id0){ cargaGrupoOwner(_id,id0);},
			}
			}) 
	}	
	if (r$('h3Owners')){
		vgk.appH3Owner = new Vue ({
			el: '#h3Owners',
			data : {grupo : 'Ninguno'},
			methods : {
				creaNuevoOwner : function(){creaNuevoOwner();},
				limpia : function(){this.grupo = 'Ninguno';},
				actualiza : function(grupo){this.grupo = grupo;}
			}
		})
	}

	if (r$('divOwners')){
		vgk.appOwner = new Vue({
			el: '#divOwners',
			data: {owners : []},
			methods : {
				limpia : function(){
					this.owners = [];
					vgk.appFlats.limpia();
					vgk.appRooms.limpia();
				},
				showFlats: function(id0){renderFlats(id0); },
				actualiza: function(owners){
					this.owners= owners;
					if (owners.length) this.showFlats(owners[0].id0);
				},
				editOwner: function(id0){
					var owner = vgk.grupo.getNodoById(id0);
					vgk.appEdit.owner = owner;
					vgk.appEdit.edit_t = 'OWNER';
					vgk.appEdit.showModal = true;
					vgk.appEdit.editON = true;
				},
				editUsrOwner: function(id0){editUsrOwner(id0);},  // en rooms_sesion.js
				goBooking : function(id0){goBooking(id0);},
			}
		}) 
	}
}


//------------------------------------------------------------------- Owners

function grabaNuevoOwner(){
	var owner = vgk.appEdit.owner;
	if (vgk.appEdit.editON) vgk.grupo.updtNodoSelf(owner);
	else {
		var raiz = vgk.grupo.getRaiz();
		vgk.grupo.addNodoHijo(raiz,owner);
//		console.log(o2s(vgk.grupo.clase2ObjDB()));
	}
	var owners = vgk.grupo.getRaspa();
	vgk.appOwner.actualiza(owners);
	updateGrupo();
	vgk.appEdit.showModal = false;
}

function creaNuevoOwner(){
	vgk.appEdit.edit_t = "OWNER";

	if (vgk.appModo.random)	vgk.appEdit.owner = new rndPropietario();
	else vgk.appEdit.owner = new Propietario();

	vgk.appEdit.showModal = true;
	vgk.appEdit.editON = false;
}


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
		params.base = '/demoRooms/';
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
	params.base = '/demoRooms/';
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
	params.base = '/demoRooms/';
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
	params.base = '/demoRooms/';
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
	params.base = '/demoRooms/';
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

}//------------------------------------------------------------------- Habitaciones

class Habitacion extends rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'Habitacion';
		this.obj = {
			codRoom : '',
			m2: '',
			precio : '',
			gastos : '',
			state : {tag:'Disponible', cod:'FREE'},
			pactos_id : 'NdN', // _id Lista de contratos
			pacto_id0 : 0, // id0 contrato en vigor
			blokeo_id0: 0, // id0 si
		}

	}
	setState(nodo){
		this.obj.state.tag = nodo.tag;
		this.obj.state.cod = nodo.cod;
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}
	
}

function initAppRooms(){
	if (r$('h3Rooms')){
		vgk.appH3Rooms = new Vue ({
			el: '#h3Rooms',
			data : {flat : 'Ninguno'},
			methods : {
				creaNuevoRoom : function(){creaNuevoRoom();},
				limpia : function(){this.flat = 'Ninguno';},
				actualiza : function(flat){this.flat = flat;}
			}
		})
	}

	if (r$('divRooms')){
		vgk.appRooms = new Vue({
			el: '#divRooms',
			data : {rooms : []},
			methods :{
				limpia : function(){this.rooms = [];},
				addPacto :function(id0){addPacto(id0)},
				showPactos: function(id0){showPactos(id0); },
				actualiza : function(rooms){
					this.rooms = rooms;
					if (rooms.length && r$('divPactos')) this.showPactos(rooms[0].id0);
					else if (!rooms.length && r$('divPactos')) vgk.appPactos.limpia();
				},
				editRoom: function(id){
					var room = vgk.grupo.getNodoById(id);
					vgk.appEdit.room = room;
					vgk.appEdit.edit_t = 'ROOM';
					vgk.appEdit.showModal = true;
					vgk.appEdit.editON = true;
					}
			}
		})
	}
}
//------------------------------------------------------------------- Reset Room
function resetRoom(){
	var room = vgk.appEdit.room;
	borraBookings(room.obj.pactos_id); // en pkg_Pactos.js
	room.obj.pactos_id = 'NdN';
	room.obj.state = {tag:'Disponible',cod:'FREE'};
	vgk.grupo.updtNodoSelf(room);
	updateGrupo();
	vgk.appPacto.actualiza([]);
	vgk.appEdit.showModal = false;
}

//------------------------------------------------------------------- Rooms
function showRooms(id){
		var flat = vgk.grupo.getNodoById(id);
		vgk.appEdit.flat = flat;
		var losRooms = [];
		flat.hijos.map(function(idH){
			var room = vgk.grupo.getNodoById(idH);
			if (!room.obj.state) room.obj.state = {tag:'Disponible', cod:'FREE'}; // Pruebas
			losRooms.push(room);
		})
		vgk.appRooms.actualiza(losRooms);
		vgk.appH3Rooms.actualiza(flat.tag);
}


function grabaNuevoRoom(){
	var room = vgk.appEdit.room;

	if (vgk.appEdit.editON) vgk.grupo.updtNodoSelf(room);
	else{ 
		var flat = vgk.grupo.getNodoById(vgk.appEdit.flat.id0);
		vgk.grupo.addNodoHijo(flat,room);
		vgk.appRooms.rooms.push(room);
	}

	updateGrupo();
	vgk.appEdit.showModal = false;
}

function creaNuevoRoom(){
	vgk.appEdit.edit_t = "ROOM";
	vgk.appEdit.editON = false;
	if (vgk.appModo.random){ 
		var n = vgk.appEdit.flat.hijos.length + 1;
		vgk.appEdit.room = new rndHabitacion('Room '+n, n);
	}
	else vgk.appEdit.room = new Habitacion();
	vgk.appEdit.showModal = true;
}
//------------------------------------------------------------------- Empleados
class Staff extends rLista {
	constructor(tag,nodos){
		super(tag,nodos)
		this.meta.iam = 'Staff';
		this.meta.org = '';
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.meta.iam = 'Staff';
		this.meta.org = objDB.meta.org;
	}
}

class Empleado extends Persona {
	constructor(tag){
		super(tag);
		this.iam = 'Empleado';
		this.obj = {
			codClerk : '',
			empresa : ''
		}
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}
}

function initAppsStaff(){

	vgk.appH3Clerks = new Vue ({
		el: '#h3Clerks',
		data : {staff : 'Ninguno'},
		methods : {
			limpia : function(){this.grupo = 'Ninguno';},
			actualiza : function(staff){this.staff = staff;}
		}
	})

	vgk.appClerk = new Vue({
		el: '#divClerks',
		data: {clerks : []},
		methods : {
			limpia : function(){this.clerks = [];},
			actualiza: function(clerks){
				this.clerks= clerks;
			},
			editClerk: function(id0){
				var clerk = vgk.staff.getNodoById(id0);
				vgk.appEdit.clerk = clerk;
				vgk.appEdit.edit_t = 'CLERK';
				vgk.appEdit.showModal = true;
				vgk.appEdit.editON = true;
			},
			editUsrClerk: function(id0){editUsrClerk(id0);},
		}
	}) 

	vgk.appListaStaffs = new Vue({
		el: '#lstStaffs',
		data: {lista: []},
		methods : {
			actualiza : function(items){
				this.lista = items;
				if (items.length > 0) this.cargaStaff(items[0]._id);
			},
			cargaStaff: function(_id){
				vgk.postGetUnStaff = ecoCargaStaff;
				getUnStaff(_id);
				}, // rooms_Ajax.js
			}
		}) 

}

function resetAppsStaff(){
	vgk.appClerk.limpia();
	vgk.appH3Clerk.limpia();
}

//------------------------------------------------------------------- Staffs
function ecoCargaStaff(){
	var clerks = vgk.staff.nodos;
	vgk.appH3Clerks.actualiza(vgk.loTopol.meta.tag);
	vgk.appClerk.actualiza(clerks);
}

function hookNuevoStaff(){
	vgk.appEdit.edit_t = "STAFF";
	vgk.appEdit.staff = "";
	vgk.appEdit.showModal = true;
}
//------------------------------------------------------------------- Clerks

function grabaNuevoClerk(){
	var clerk = vgk.appEdit.clerk;
	if (vgk.appEdit.editON) vgk.staff.updtNodoSelf(clerk);
	else {
		vgk.staff.addNodo(clerk);
//		console.log(JSON.stringify(vgk.grupo.clase2ObjDB()));
	}
	var clerks = vgk.staff.nodos;
	vgk.appClerk.actualiza(clerks);
	updaDemoaff();
	vgk.appEdit.showModal = false;
}

function hookNuevoClerk(){
	var clerk = new Empleado();
	clerk.obj.empresa = vgk.user.org;

	vgk.appEdit.clerk = clerk;
	vgk.appEdit.edit_t = "CLERK";
	vgk.appEdit.showModal = true;
	vgk.appEdit.editON = false;
}

//------------------------------------------------------------------- Staff
function ecoUpdaDemoaff(xhr){
	console.log('Eco Updt Staff: ');
}

function updaDemoaff(){
	if (vgk.staff.meta.org != vgk.user.org){
		alert('Staff sin ORG:' + vgk.staff.meta.org +':'+ vgk.user.org);
		vgk.staff.meta.org = vgk.user.org;
	};

	var params = vgApp.paramsXHR;
	params.base = '/demoRooms/';
	params.eco = ecoUpdaDemoaff;
	params.txt = o2s(vgk.staff.clase2ObjDB());
	params.topolId = vgk.staff_id;
	ajaxPutTopol(params);
	return false;
}

function ecoGetUnStaff(xhr){
		var respTxt = xhr.responseText;
		vgk.loTopol = JSON.parse(respTxt);
		vgk.staff_id = vgk.loTopol._id;
		vgk.staff = new Staff("",[]);
		vgk.staff.objDB2Clase(vgk.loTopol);

		vgk.postGetUnStaff();
}

function getUnStaff(_id){
	vgk.staff_id = _id;

	var params = vgApp.paramsXHR;
	params.base = '/demoRooms/';
	params.eco = ecoGetUnStaff;
	params.topolId = _id;

	ajaxGet1Topol(params);

	return false;
}


function ecoNuevoStaff(xhr){
	ajaxGetStaff();
}

function grabaNuevoStaff(){
	var tag = rInitCap(vgk.user.org);
	vgk.staff = new Staff(tag,[]);
	vgk.staff.meta.org = vgk.user.org;

	var params = vgApp.paramsXHR;
	params.base = '/demoRooms/';
	params.eco = ecoNuevoStaff;
	params.iam = 'Staff';
	params.txt = o2s(vgk.staff.clase2ObjDB());
	ajaxPostTopol(params);
}


function ecoGetStaff(xhr){
	var respTxt = xhr.responseText;
	var objs = JSON.parse(respTxt);
	var items = [];
	objs.map(function(obj){
	 try{ if (obj.meta.iam == 'Staff' && obj.meta.org == vgk.user.org) items.push(obj);} catch(e){null}
	})
	if (items.length > 0) vgk.appListaStaffs.actualiza(items);
	else {
		var ok = confirm('No hay ninguna lista. \nCrearla?');
		if (ok) grabaNuevoStaff();

	}
}



function ajaxGetStaff() {

	var params = vgApp.paramsXHR;
	params.base = '/metas/';
	params.eco = ecoGetStaff;
	params.iam = 'Staff';

	ajaxGetMetas(params);
 }



//-------------------------------------------------------------------Busqueda x Clerk
function ecoCargaStaffClerk(xhr){
	var respTxt = xhr.responseText;
	vgk.loTopol = JSON.parse(respTxt);
	vgk.grupo = new rArbol("",[]);
	vgk.grupo.objDB2Clase(vgk.loTopol);

	resetApps(); // en vAppsRooms.js

	var clerk = vgk.grupo.getNodoById(vgk.clerk_id0);
	vgk.appH3Clerk.actualiza(vgk.loTopol.meta.tag);
	vgk.appClerk.actualiza([clerk]);
	vgk.staff_id = vgk.loTopol._id;

//	renderPisos(vgk.clerk_id0);
}

function cargaStaffClerk(_id,id0){
	vgk.clerk_id0 = id0;
	vgk.staff_id = _id;
	var url = vgk.urlServer+':'+vgk.portNode;
	var xhr = getXHR('GET',url +'/DemoRooms/'+_id, ecoCargaStaffClerk);
	xhr.send(null);
	return false;
}

function ecoGetListaClerks(xhr){
	var respTxt = xhr.responseText;
	var objs = JSON.parse(respTxt);
	var items = [];
	objs.map(function(obj){
		var todo = obj.nodos.tag+'-'+obj.nodos.obj.nombre+'-'+obj.nodos.obj.apell;
		var ok = todo.search(new RegExp(vgk.patron, "i"));
		if (ok !=-1){
				item = {};
				item._id = obj._id;
				item.id0 = obj.nodos.id0;
				var tag = obj.nodos.tag;
				var nom = obj.nodos.obj.nombre+' '+obj.nodos.obj.apell;
				console.log(tag+':'+nom);
				item.tag = tag.substr(0,30);
				item.nom = nom.substr(0,30-tag.length);
				items.push(item);
			}
	})
	vgk.appListaClerks.actualiza(items);
}

function buscarPorClerk(){
	vgk.patron = prompt('Patrón:','');
	var url = vgk.urlServer+':'+vgk.portNode;
	var xhr = getXHR('GET',url +'/clerks', ecoGetListaClerks);
	xhr.send(null);
}


/*
 Un inventario  (Stock) es el conjunto de Items que hay almacenados en un espacio
 El piso es un Item que contiene otros Items (habitaciones, pasillos, etc)
 Los muebles son Items que pueden contener Items. (Armarios, cómodas, mesillas, etc)
 Un Item se relaciona con 'su padre' por la posición: 
 	+ Flexo 'sobre' mesa
 	+ Cuadro 'cuelga [de]' pared
 	+ Cojín 'sobre' Sofá
 	+ Lámpara 'cuelga [de]' techo
 	+ Cajón 'parte [de]' mesa

Los Items pueden tener informado el campo 'Factura', que detallaría la compra del Item

 Hay Items especiales 'Chismes' que tienen : Marca, Modelo, Num serie, y manual (PDF).

 Son electrodomésticos :
 	+ Nevera
 	+ Microondas
 	- Lavavajillas
 	+ Lavadora
 	+ etc etc

 	O aparatos electrónicos :
 	+ Televisor
 	+ Reproductor DVD
 	+ Equipo Hi-Fi
 	+ Ordenador
 	+ Router WiFi
*/

class Stock extends rArbol {
	constructor(tag,nodos){
		super(tag,nodos);
		this.meta.iam = 'Stock';
	}

	nodo2vue(nodo,vueObj){
		vueObj.id0 = nodo.id0;
		vueObj.tag = nodo.tag;
		vueObj.iam = nodo.iam;
		if (nodo.iam == 'Item' && nodo.obj.descrip.length>0) vueObj.descrip = '('+nodo.obj.descrip+')';
		vueObj.hijos = [];
		var n = nodo.hijos.length;
		if (!n) return;
		for (var i=0;i<n;i++){
			var nodoH = this.getNodoById(nodo.hijos[i]);
			var vueH = {};
			this.nodo2vue(nodoH,vueH);
			vueObj.hijos.push(vueH);
		}
	}

	reto2vue(){
		var vueObj = {};
		var raiz = this.nodos[0];
		this.nodo2vue(raiz,vueObj);
		return vueObj;
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.meta.iam = objDB.meta.iam;
		this.meta.org = objDB.meta.org;
	}

}

class Factura extends rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'Factura';
		this.obj = {
			provd: '',
			fecha:'', // string dd/mm/aaaa
			numFra:'',
			euros:'',
			PDF : ''  // link a documento PDF
		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}
}

class Item extends rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'Item';
		this.obj = {
			tipo: '',
			posic:'',
			descrip:'',
			factura:'', // new Factura
			estado : 'OK'
		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}
}

class Chisme extends Item {
	constructor(tag){
		super(tag);
		this.iam = 'Chisme';
		this.obj = {
			marca  : '',
			modelo : '',
			serie  : '',
			manual : '' // link a un documento PDF
		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}
}

function initAppsStock(){
	vgk.dataStock = {};

// define the item component
	vgk.itemStock = Vue.component('item', {
		template: '#item-template',
		props: {
			model: Object
		},
		data: function () {
			return {
				open: false
			}
		},
		computed: {
			isFolder: function () {
				return this.model.hijos && this.model.hijos.length;
			}
		},
		methods: {
			toggle: function () {
				if (this.isFolder) this.open = !this.open;
			},
			changeType: function () {
				if (!this.isFolder) {
					Vue.set(this.model, 'hijos', []);
						this.addChild();
						this.open = true;
					}
				},
			addChild: function () {
				addNuevoItem(this.model.id0);
			},
			editItem: function () {
				editItem(this.model);
			}
		} // methods
	}) // Vue.component

// boot up the demo
vgk.appStock = new Vue({
	el: '#stock',
		data: {
			treeData: vgk.dataStock
		},
	methods : {
		actualiza : function(stock){this.treeData = stock}
	}
})

} // function

//===================================================================	Show/Edit Stock (Inventario)

function showStockVue(){
	var vueStock = vgk.stock.reto2vue();
	vgk.appStock.actualiza(vueStock);
}
//------------------------------------------------------------------- Crear Stock / Propietario

function addNuevoItem(id0){
	var item = new Item('Nuevo');
	var padre = vgk.stock.getNodoById(id0);
	vgk.stock.addNodoHijo(padre,item);
	showStockVue(vgk.stock);
	updaDemoock();
}

function grabaNuevoItem(){
	var item = vgk.appEdit.item;

	if (vgk.appEdit.editON) vgk.stock.updtNodoSelf(item);
	else{ 
		alert('No es Edit??');
	}
	showStockVue(vgk.stock);
	updaDemoock();
	vgk.appEdit.showModal = false;

}

function addNuevoHijo(){
	var item = vgk.appEdit.item;

	if (vgk.appEdit.editON){
		var nuevo = new Item('Nuevo');
		vgk.stock.addNodoHijo(item,nuevo);
	}
	else{ 
		alert('No es Edit??');
	}
	showStockVue(vgk.stock);
	updaDemoock();
	vgk.appEdit.showModal = false;

}

function editItem(model){
	var item = vgk.stock.getNodoById(model.id0);
	vgk.appEdit.item = item;
	vgk.appEdit.edit_t = "ITEM";
	vgk.appEdit.editON = true;
	vgk.appEdit.showModal = true;
}

//------------------------------------------------------------------- CRUD Stocks MongoDB
function ecoGrabaStock(xhr){
	var resp = JSON.parse(xhr.responseText);
	vgk.stock_id = resp._id;

	if (!vgk.piso.obj.stock_id || vgk.piso.obj.stock_id == 'NdN'){
		vgk.piso.obj.stock_id = resp._id;
		vgk.grupo.updtNodoSelf(vgk.piso);
		console.log('ya! '+ o2s(vgk.piso));
		updateGrupo();
	}
	console.log ('Grabado nuevo stock: ' + resp._id);
	return false;
}

function grabaNuevoStock(piso){
	var raiz = new rNodo(piso.tag);
	vgk.stock = new Stock('Stock_'+piso.obj.codPiso,[raiz]);
	showStockVue();
	vgk.stock.meta.org = vgk.user.org;

	var params = vgApp.paramsXHR;
	params.base = '/demoRooms/';
	params.eco = ecoGrabaStock; 
	params.iam = 'Stock';
	params.txt = o2s(vgk.stock.clase2ObjDB());
	ajaxPostTopol(params);

	vgk.appEdit.showModal = false;
}



function ecoUpdaDemoock(xhr){
	var resp = JSON.parse(xhr.responseText);
	console.log('Actualizado stock: ' + resp._id);
	return false;
}

function updaDemoock(){
	if (vgk.stock.meta.org != vgk.user.org){
		alert('Stock sin ORG:' + vgk.stock.meta.org +':'+ vgk.user.org);
		vgk.stock.meta.org = vgk.user.org;
	};

	var params = vgApp.paramsXHR;
	params.base = '/demoRooms/';
	params.eco = ecoUpdaDemoock;
	params.txt = o2s(vgk.stock.clase2ObjDB());
	params.topolId = vgk.stock_id;
	ajaxPutTopol(params);
	return false;
}

//------------------------------------------------------------------- Pick Stock
function ecoGetUnStock(xhr){
		var respTxt = xhr.responseText;
		vgk.loTopol = JSON.parse(respTxt);
		vgk.stock_id = vgk.loTopol._id;
		vgk.stock = new Stock("",[]);
		vgk.stock.objDB2Clase(vgk.loTopol);

		vgk.postGetUnStock();
}

function getUnStock(_id){
	vgk.stock_id = _id;
	var params = vgApp.paramsXHR;
	params.base = '/demoRooms/';
	params.eco = ecoGetUnStock;
	params.topolId = _id;

	ajaxGet1Topol(params);

	return false;
}

