//------------------------------------------------------------------ Go Inventario
function goInventario(id0){
	window.location = 'stocks.html?idSess='+vgk.params.idSess+'::'+vgk.grupo_id+'::'+id0;
}
//------------------------------------------------------------------ Go Inventario
function goInformacion(id0){
	window.location = 'faqs.html?idSess='+vgk.params.idSess+'&idStock='+id0;
}
//------------------------------------------------------------------ Go Inventario
function goCalendar(id0){
	window.location = 'gastos.html?idSess='+vgk.params.idSess+'::'+vgk.grupo_id+'::'+vgk.appEdit.flat.id0;
}
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
	getGrupoByOwner(vgk.user._id,vgk.user.id0);
}

//------------------------------------------------------------------- Init
function sesionOwnersOK(sesion){
	var _id = sesion._id;
	var id0 = sesion.id0
	var stmt = 'select _id,id0,usr,rol,org from users where _id="'+_id+'" and id0='+id0+';';
	getUsuario(stmt,actualizaUserMenu);


	var csvTA = r$('csvTA'); // textarea para import  gastos/pagos
	csvTA.addEventListener('paste', prePegado);
}

function initOwners(){
	initApps();
	initAppGrupo();
	initAppOwner();
	initAppFlats();
	initAppRooms();
	initAppPactos();
	initAppMoney();
	validaSesion(sesionOwnersOK);
}
