// rooms_Random.js

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
}