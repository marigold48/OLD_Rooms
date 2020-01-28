// pkg_Flats.js
//------------------------------------------------------------------- Flats
// obj.state: Estado de las habitaciones. Representa el valor por cada habitación
// Ej (para 4 habitaciones):['LIBRE','BOOKED','LIBRE','RENTED'] 
class Piso extends rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'Flat';
		this.obj = {
			codFlat : '',
			direcc : '',
			cpostal: '',
			poblac : '',
			prov : '',
			gastos_id : 'NdN', // Gastos (Gastos). Se crea al addGasto por primera vez
			stock_id : 'NdN', // Stock (Inventario) del piso. se crea cuando se invoca stocks.html
			faqs_id : 'NdN', // FAQs (Información) del piso. se crea cuando se invoca faqs.html
			state : [], // no usado de momento
			geo : '', // coordenadas GPS/UTM etc. No usado de momento
			strDirecc : '' // para geocodificación 
		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}

}


function initAppFlats(){

	if (r$('lstFlats')){
		vgk.appListaFlats = new Vue({
			el: '#lstFlats',
			data: {lista: []},
			methods : {
				actualiza : function(items){this.lista = items},
				cargaFlat: function(_id,id0){ cargaGrupoFlat(_id,id0);},
			}
			}) 
	}
	if(r$('h3Flats')){
		vgk.appH3Flats = new Vue ({
			el: '#h3Flats',
			data : {owner : 'Ninguno'},
			methods : {
				creaNuevoFlat : function(){creaNuevoFlat();},
				limpia : function(){this.owner = 'Ninguno';},
				actualiza : function(owner){this.owner = owner;}
			}
		})
	}
	
	if(r$('divFlats')){
		vgk.appFlats = new Vue({
			el: '#divFlats',
			data : {flats : []},
			methods :{
				limpia : function(){
					this.flats = [];
					vgk.appRooms.limpia();
				},
				editStock : function(id0){goInventario(id0);},
				editFAQs : function(id0){goInformacion(id0);},
				addGasto : function(id0){creaGasto(id0);},
				addRoom :function(id0){addRoom(id0)},
				showRooms :function(id0){showRooms(id0)},
				showGastos:function(id0){showGastos(id0)},  // en pkg_Money.js
				borraRebuts:function(id0){borraRebuts(id0)},  // en pkg_Money.js
				actualiza : function(flats){
					this.flats = flats;
					if (flats.length){
						this.showRooms(flats[0].id0);
						if (vgk.appH3Gastos){
							vgk.appH3Gastos.actualiza(flats[0].tag);
							this.showGastos(flats[0].id0);
							
						}
						if (vgk.appH3Import) vgk.appH3Import.actualiza(vgk.appH3Rooms.flat);
					}
					else {
						vgk.appRooms.limpia();
					}
				},
				editFlat: function(id0){
					var flat = vgk.grupo.getNodoById(id0);
					vgk.appEdit.flat = flat;
					vgk.appEdit.edit_t = 'FLAT';
					vgk.appEdit.showModal = true;
					vgk.appEdit.editON = true;
				},
				operacFlat : function(id0){
					var idSess = vgk.params.idSess;
					window.location='operacRooms.html?idSess='+idSess+'::'+vgk.grupo_id+'::'+id0;
				}
			}
		})
	}	
}
//------------------------------------------------------------------- Reset Flat
function resetFlat(){
	var flat = vgk.appEdit.flat;
	borraRebuts(flat.obj.gastos_id); // en pkg_Money.js
	flat.obj.gastos_id = 'NdN';
	vgk.grupo.updtNodoSelf(flat);
	updateGrupo();
	vgk.appGastos.actualiza([]);
	vgk.appEdit.showModal = false;
}

//------------------------------------------------------------------- Flats
function renderFlats(id){
		var owner = vgk.grupo.getNodoById(id);
		vgk.appH3Flats.actualiza(owner.tag);
		vgk.appEdit.owner = owner;
		var losFlats = [];
		owner.hijos.map(function(idH){
			var flat = vgk.grupo.getNodoById(idH);
			losFlats.push(flat);
		})
		if (vgk.appFlats){vgk.appFlats.actualiza(losFlats)}
		else{
			alert('appFlats no inicializada');
		}
}


function grabaNuevoFlat(){
	var flat = vgk.appEdit.flat;

	if (vgk.appEdit.editON) vgk.grupo.updtNodoSelf(flat);
	else{ 
		var owner = vgk.appEdit.owner;
		vgk.grupo.addNodoHijo(owner,flat);
		vgk.appFlats.flats.push(flat);
	}

	updateGrupo();
	vgk.appEdit.showModal = false;
}

function creaNuevoFlat(){
	vgk.appEdit.showModal = false;
	vgk.appEdit.edit_t = "FLAT";
	vgk.appEdit.editON = false;
	if (vgk.appModo.random) vgk.appEdit.flat = new rndPiso();
	else vgk.appEdit.flat = new Piso();
	vgk.appEdit.showModal = true;
}

