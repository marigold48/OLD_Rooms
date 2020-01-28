function ecoCreaUsuario(xhr){
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

