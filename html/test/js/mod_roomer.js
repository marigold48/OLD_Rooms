//------------------------------------------------------------------ Go Inventario
function goInventario(){
	window.location = 'stocks.html?idSess='+vgk.params.idSess+'::'+vgk.grupo_id+'::'+vgk.flat.id0;
}

function actualizaRestoApps(){
	vgk.room = vgk.grupo.getNodoById(parseInt(vgk.pacto.obj.room_id0));
	vgk.flat = vgk.grupo.getNodoById(vgk.room.id1);
	vgk.owner = vgk.grupo.getNodoById(vgk.flat.id1);
	vgk.appOwner.actualiza([vgk.owner]);
}

//------------------------------------------------------------------- userMenu/vueApp cascade
function getGrupoByPacto(){
	var _id = vgk.pacto.obj.grupo_id;
	if (_id + 'NdN' == 'NdN'){alert('No Grupo especificado');cierraSesion();}
	else {
		vgk.postGetUnGrupo = actualizaRestoApps;
		getUnGrupo(_id);
	}
}

//------------------------------------------------------------------- userMenu/vueApp cascade
function actualizaVueApps(){
//	resetApps(); // en vAppsRooms.js
	if (vgk.user.id0.length == 7){
		vgk.pacto = vgk.pactos.getNodoById(parseInt(vgk.user.id0));
		vgk.appPacto.actualiza([vgk.pacto]);
		getGrupoByPacto();
	}
	else alert('No hay id0');
}

function actualizaUserMenu(xhr){
	var filas = csv2filas(xhr.responseText)
	if (!filas) {alert('get Usuario: No filas');cierraSesion();}
	if (filas.length == 0){
		alert('No existe este usuario/password' );
		cierraSesion();
	}
	vgk.user = filas[0];
	console.log(o2s(vgk.user));
	var usrMenu = r$("usrMenu");
	if (usrMenu) usrMenu.innerHTML = ' '+vgk.user.usr;

	vgk.postGetUnBookings = actualizaVueApps;
	getUnBookings(vgk.user._id,vgk.user.id0);
}

//------------------------------------------------------------------- Init
function sesionRoomerOK(sesion){
	var _id = sesion._id;
	var id0 = sesion.id0
	var stmt = 'select _id,id0,usr,rol,org from users where _id="'+_id+'" and id0='+id0+';';
	getUsuario(stmt,actualizaUserMenu);


	var csvTA = r$('csvTA'); // textarea para import  gastos/pagos
	csvTA.addEventListener('paste', prePegado);
}

function initRoomer(){
	initApps();
	initAppGrupo();
	initAppOwner();
	initAppFlats();
	initAppRooms();
	initAppPactos();
	initAppMoney();
	validaSesion(sesionRoomerOK);
}
