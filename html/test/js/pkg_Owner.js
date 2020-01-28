//pkg_Owner.js
//------------------------------------------------------------------- Propietarios

class Propietario extends Persona {
	constructor(tag){
		super(tag);
		this.iam = 'Propietario';
		this.obj.codOwner = '',
		this.obj.codIBAN = ''
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}
}
function initAppOwner(){
	
	if(r$('lstOwners')){
		vgk.appListaOwners = new Vue({
			el: '#lstOwners',
			data: {lista: []},
			methods : {
				actualiza : function(items){this.lista = items},
				cargaOwner: function(_id,id0){ cargaGrupoOwner(_id,id0);},
			}
			}) 
	}	
	if (r$('h3Owners')){
		vgk.appH3Owner = new Vue ({
			el: '#h3Owners',
			data : {grupo : 'Ninguno'},
			methods : {
				creaNuevoOwner : function(){creaNuevoOwner();},
				limpia : function(){this.grupo = 'Ninguno';},
				actualiza : function(grupo){this.grupo = grupo;}
			}
		})
	}

	if (r$('divOwners')){
		vgk.appOwner = new Vue({
			el: '#divOwners',
			data: {owners : []},
			methods : {
				limpia : function(){
					this.owners = [];
					vgk.appFlats.limpia();
					vgk.appRooms.limpia();
				},
				showFlats: function(id0){renderFlats(id0); },
				actualiza: function(owners){
					this.owners= owners;
					if (owners.length) this.showFlats(owners[0].id0);
				},
				editOwner: function(id0){
					var owner = vgk.grupo.getNodoById(id0);
					vgk.appEdit.owner = owner;
					vgk.appEdit.edit_t = 'OWNER';
					vgk.appEdit.showModal = true;
					vgk.appEdit.editON = true;
				},
				editUsrOwner: function(id0){editUsrOwner(id0);},  // en rooms_sesion.js
				goBooking : function(id0){goBooking(id0);},
			}
		}) 
	}
}


//------------------------------------------------------------------- Owners

function grabaNuevoOwner(){
	var owner = vgk.appEdit.owner;
	if (vgk.appEdit.editON) vgk.grupo.updtNodoSelf(owner);
	else {
		var raiz = vgk.grupo.getRaiz();
		vgk.grupo.addNodoHijo(raiz,owner);
//		console.log(o2s(vgk.grupo.clase2ObjDB()));
	}
	var owners = vgk.grupo.getRaspa();
	vgk.appOwner.actualiza(owners);
	updateGrupo();
	vgk.appEdit.showModal = false;
}

function creaNuevoOwner(){
	vgk.appEdit.edit_t = "OWNER";

	if (vgk.appModo.random)	vgk.appEdit.owner = new rndPropietario();
	else vgk.appEdit.owner = new Propietario();

	vgk.appEdit.showModal = true;
	vgk.appEdit.editON = false;
}


