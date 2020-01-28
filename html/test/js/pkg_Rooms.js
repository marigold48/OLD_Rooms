//------------------------------------------------------------------- Habitaciones

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
