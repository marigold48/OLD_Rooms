//------------------------------------------------------------------- Empleados
class Staff extends rLista {
	constructor(tag,nodos){
		super(tag,nodos)
		this.meta.iam = 'Staff';
		this.meta.org = '';
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.meta.iam = 'Staff';
		this.meta.org = objDB.meta.org;
	}
}

class Empleado extends Persona {
	constructor(tag){
		super(tag);
		this.iam = 'Empleado';
		this.obj = {
			codClerk : '',
			empresa : ''
		}
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}
}

function initAppsStaff(){

	vgk.appH3Clerks = new Vue ({
		el: '#h3Clerks',
		data : {staff : 'Ninguno'},
		methods : {
			limpia : function(){this.grupo = 'Ninguno';},
			actualiza : function(staff){this.staff = staff;}
		}
	})

	vgk.appClerk = new Vue({
		el: '#divClerks',
		data: {clerks : []},
		methods : {
			limpia : function(){this.clerks = [];},
			actualiza: function(clerks){
				this.clerks= clerks;
			},
			editClerk: function(id0){
				var clerk = vgk.staff.getNodoById(id0);
				vgk.appEdit.clerk = clerk;
				vgk.appEdit.edit_t = 'CLERK';
				vgk.appEdit.showModal = true;
				vgk.appEdit.editON = true;
			},
			editUsrClerk: function(id0){editUsrClerk(id0);},
		}
	}) 

	vgk.appListaStaffs = new Vue({
		el: '#lstStaffs',
		data: {lista: []},
		methods : {
			actualiza : function(items){
				this.lista = items;
				if (items.length > 0) this.cargaStaff(items[0]._id);
			},
			cargaStaff: function(_id){
				vgk.postGetUnStaff = ecoCargaStaff;
				getUnStaff(_id);
				}, // rooms_Ajax.js
			}
		}) 

}

function resetAppsStaff(){
	vgk.appClerk.limpia();
	vgk.appH3Clerk.limpia();
}

//------------------------------------------------------------------- Staffs
function ecoCargaStaff(){
	var clerks = vgk.staff.nodos;
	vgk.appH3Clerks.actualiza(vgk.loTopol.meta.tag);
	vgk.appClerk.actualiza(clerks);
}

function hookNuevoStaff(){
	vgk.appEdit.edit_t = "STAFF";
	vgk.appEdit.staff = "";
	vgk.appEdit.showModal = true;
}
//------------------------------------------------------------------- Clerks

function grabaNuevoClerk(){
	var clerk = vgk.appEdit.clerk;
	if (vgk.appEdit.editON) vgk.staff.updtNodoSelf(clerk);
	else {
		vgk.staff.addNodo(clerk);
//		console.log(JSON.stringify(vgk.grupo.clase2ObjDB()));
	}
	var clerks = vgk.staff.nodos;
	vgk.appClerk.actualiza(clerks);
	updateStaff();
	vgk.appEdit.showModal = false;
}

function hookNuevoClerk(){
	var clerk = new Empleado();
	clerk.obj.empresa = vgk.user.org;

	vgk.appEdit.clerk = clerk;
	vgk.appEdit.edit_t = "CLERK";
	vgk.appEdit.showModal = true;
	vgk.appEdit.editON = false;
}

//------------------------------------------------------------------- Staff
function ecoUpdateStaff(xhr){
	console.log('Eco Updt Staff: ');
}

function updateStaff(){
	if (vgk.staff.meta.org != vgk.user.org){
		alert('Staff sin ORG:' + vgk.staff.meta.org +':'+ vgk.user.org);
		vgk.staff.meta.org = vgk.user.org;
	};

	var params = vgApp.paramsXHR;
	params.base = '/testRooms/';
	params.eco = ecoUpdateStaff;
	params.txt = o2s(vgk.staff.clase2ObjDB());
	params.topolId = vgk.staff_id;
	ajaxPutTopol(params);
	return false;
}

function ecoGetUnStaff(xhr){
		var respTxt = xhr.responseText;
		vgk.loTopol = JSON.parse(respTxt);
		vgk.staff_id = vgk.loTopol._id;
		vgk.staff = new Staff("",[]);
		vgk.staff.objDB2Clase(vgk.loTopol);

		vgk.postGetUnStaff();
}

function getUnStaff(_id){
	vgk.staff_id = _id;

	var params = vgApp.paramsXHR;
	params.base = '/testRooms/';
	params.eco = ecoGetUnStaff;
	params.topolId = _id;

	ajaxGet1Topol(params);

	return false;
}


function ecoNuevoStaff(xhr){
	ajaxGetStaff();
}

function grabaNuevoStaff(){
	var tag = rInitCap(vgk.user.org);
	vgk.staff = new Staff(tag,[]);
	vgk.staff.meta.org = vgk.user.org;

	var params = vgApp.paramsXHR;
	params.base = '/testRooms/';
	params.eco = ecoNuevoStaff;
	params.iam = 'Staff';
	params.txt = o2s(vgk.staff.clase2ObjDB());
	ajaxPostTopol(params);
}


function ecoGetStaff(xhr){
	var respTxt = xhr.responseText;
	var objs = JSON.parse(respTxt);
	var items = [];
	objs.map(function(obj){
	 try{ if (obj.meta.iam == 'Staff' && obj.meta.org == vgk.user.org) items.push(obj);} catch(e){null}
	})
	if (items.length > 0) vgk.appListaStaffs.actualiza(items);
	else {
		var ok = confirm('No hay ninguna lista. \nCrearla?');
		if (ok) grabaNuevoStaff();

	}
}



function ajaxGetStaff() {

	var params = vgApp.paramsXHR;
	params.base = '/metas/';
	params.eco = ecoGetStaff;
	params.iam = 'Staff';

	ajaxGetMetas(params);
 }



//-------------------------------------------------------------------Busqueda x Clerk
function ecoCargaStaffClerk(xhr){
	var respTxt = xhr.responseText;
	vgk.loTopol = JSON.parse(respTxt);
	vgk.grupo = new rArbol("",[]);
	vgk.grupo.objDB2Clase(vgk.loTopol);

	resetApps(); // en vAppsRooms.js

	var clerk = vgk.grupo.getNodoById(vgk.clerk_id0);
	vgk.appH3Clerk.actualiza(vgk.loTopol.meta.tag);
	vgk.appClerk.actualiza([clerk]);
	vgk.staff_id = vgk.loTopol._id;

//	renderPisos(vgk.clerk_id0);
}

function cargaStaffClerk(_id,id0){
	vgk.clerk_id0 = id0;
	vgk.staff_id = _id;
	var url = vgk.urlServer+':'+vgk.portNode;
	var xhr = getXHR('GET',url +'/DemoRooms/'+_id, ecoCargaStaffClerk);
	xhr.send(null);
	return false;
}

function ecoGetListaClerks(xhr){
	var respTxt = xhr.responseText;
	var objs = JSON.parse(respTxt);
	var items = [];
	objs.map(function(obj){
		var todo = obj.nodos.tag+'-'+obj.nodos.obj.nombre+'-'+obj.nodos.obj.apell;
		var ok = todo.search(new RegExp(vgk.patron, "i"));
		if (ok !=-1){
				item = {};
				item._id = obj._id;
				item.id0 = obj.nodos.id0;
				var tag = obj.nodos.tag;
				var nom = obj.nodos.obj.nombre+' '+obj.nodos.obj.apell;
				console.log(tag+':'+nom);
				item.tag = tag.substr(0,30);
				item.nom = nom.substr(0,30-tag.length);
				items.push(item);
			}
	})
	vgk.appListaClerks.actualiza(items);
}

function buscarPorClerk(){
	vgk.patron = prompt('Patrón:','');
	var url = vgk.urlServer+':'+vgk.portNode;
	var xhr = getXHR('GET',url +'/clerks', ecoGetListaClerks);
	xhr.send(null);
}

