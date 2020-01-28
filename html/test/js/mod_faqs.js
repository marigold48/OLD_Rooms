
//------------------------------------------------------------------- userMenu/vueApp cascade
function verificarStock(){
	vgk.flat = vgk.grupo.getNodoById(vgk.params.idStock);
	var _id = vgk.flat.obj.stock_id;
	if (_id == 'NdN'){
		var ok = confirm('No hay ningún Inventario.\nCrearlo?');
		if (ok) grabaNuevoStock(vgk.flat);
	}
	else {
		vgk.postGetUnStock = showStockVue;
		getUnStock(_id);
	}
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

	vgk.postGetUnGrupo = verificarStock;
	getUnGrupo(vgk.user._id);
}

//------------------------------------------------------------------- Init
function sesionStocksOK(sesion){
	var _id = sesion._id;
	var id0 = sesion.id0
	var stmt = 'select _id,id0,usr,rol,org from users where _id="'+_id+'" and id0='+id0+';';
	getUsuario(stmt,actualizaUserMenu);
}

function initStocks(){
	initApps();
	initAppGrupo();
	initAppOwner();
	initAppFlats();
	initAppRooms();
	initAppPactos();
	initAppMoney();
	initAppsStock();
	validaSesion(sesionStocksOK);
}
