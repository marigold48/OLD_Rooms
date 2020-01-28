function goBooking(id0){
	var _id = vgk.grupo_id;
	window.location = 'booking.html?idSess='+vgk.params.idSess+'::'+_id+'::'+id0;
}


//------------------------------------------------------------------- userMenu/vueApp cascade
function actualizaVueApps(){
	resetApps(); // en vAppsRooms.js
	var owners = vgk.grupo.getRaspa();
	vgk.appH3Owner.actualiza(vgk.loTopol.meta.tag);
	vgk.appOwner.actualiza(owners);
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
	ajaxGetGrupos();

}
//------------------------------------------------------------------- Init
function sesionStateOK(sesion){
	var _id = sesion._id;
	var id0 = sesion.id0
	var stmt = 'select _id,id0,usr,rol,org from users where _id="'+_id+'" and id0='+id0+';';
	getUsuario(stmt,actualizaUserMenu);

	vgk.rnd = new rRND();
}

function initState(){
	console.log('initState');
	initApps();
	initAppGrupo();
	initAppOwner();
	initAppFlats();
	initAppRooms();

	validaSesion(sesionStateOK);
}
