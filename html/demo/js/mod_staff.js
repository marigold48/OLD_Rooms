
//------------------------------------------------------------------- userMenu/vueApp cascade
function actualizaVueApps(){
//	resetApps(); // en vAppsRooms.js
	if (vgk.user.id0.length == 7){
		var owner = vgk.grupo.getNodoById(parseInt(vgk.user.id0));
		vgk.appOwner.actualiza([owner]);
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

	vgk.postGetUnGrupo = actualizaVueApps;
	ajaxGetStaff(); // rooms_Ajax.js
}

//------------------------------------------------------------------- Init
function sesionStaffOK(sesion){
	var _id = sesion._id;
	var id0 = sesion.id0
	var stmt = 'select * from users where _id="'+_id+'" and id0='+id0+';';
	getUsuario(stmt,actualizaUserMenu);
}

function initStaff(){
	initApps();
	initAppsStaff();
	validaSesion(sesionStaffOK); // libK1_sesion.js
}
