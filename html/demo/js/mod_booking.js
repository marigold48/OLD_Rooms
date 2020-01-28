//------------------------------------------------------------------- userMenu/vueApp cascade

function actualizaVueApps(){
	resetApps(); // en vAppsOpRooms.js
	var owner = vgk.grupo.getNodoById(vgk.owner_id0);
	vgk.appOwner.actualiza([owner]);
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

	vgk.postGetUnGrupo = actualizaVueApps;
	getGrupoByOwner(vgk.topol_id,vgk.nodo_id0);

}

//------------------------------------------------------------------- Init

function sesionBookingOK(sesion){
	var _id = sesion._id;
	var id0 = sesion.id0
	var stmt = 'select * from users where _id="'+_id+'" and id0='+id0+';';
	getUsuario(stmt,actualizaUserMenu);
	vgk.rnd = new rRND();
}

function initBooking(){
	initApps();
	initAppGrupo();
	initAppOwner();
	initAppFlats();
	initAppRooms();
	initAppPactos();
	validaSesion(sesionBookingOK);
}
