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
	params.base = '/testRooms/';
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
	params.base = '/testRooms/';
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
	params.base = '/testRooms/';
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
	params.base = '/testRooms/';
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

