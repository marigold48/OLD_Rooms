// Funciones de vueApps comunes a la aplicación RETO/Rooms

function initModal(){
	if (r$('modal-template')){
		alert('initModal');
		Vue.component('modal', {
			template: '#modal-template'
		})
	}	
	if (r$('modal-template-big')){
		Vue.component('modal-big', {
			template: '#modal-template-big'
		})
	}

	if (r$('appEdit')){
		vgk.appEdit = new Vue({
			el: '#appEdit',
			data: { 
				showModal: false,
				editON : false,
				edit_t : '', //CLERK|GRUPO|OWNER|FLAT|ROOM|
				ix : '',
				opciones : [],
				valorSel : '',
				valores : [],
				chkValor : true,
				grupo:'', // string nombre del grupo
				user:{},
				clerk:{},
				owner:{},
				piso:{},
				room:{},
				fechas:[],
				gasto_t:[],
			},
			methods : {
				cambiaVista : function(ev){alert(this.valores.join('|'));}, // select multiple Vista
				chkClick : function(ev){this.chkValor = !this.chkValor;}, //  mostrar/oculto en form edit Gasto_t
				handleChange : function(ev){this.valorSel = ev.target.value;}, // Select states
				resetRoom : function(id0){resetRoom(id0)}, // en pkg_Rooms.js
				resetFlat : function(id0){resetFlat(id0)} // en pkg_Flats.js
	
			}
		})
	}

	if (r$('appEditBig')){
		vgk.appEditBig = new Vue({
			el: '#appEditBig',
			data: { 
				showModal: false,
				editON : false,
				edit_t : '',
				grupo : '',
				rebuts : '',
				ix : '',
				pacto:{},
				fechas:[]
			},
			methods : {
				editGastoT : function(id0,ix){editGastoT(id0,ix)}, // en pkg_Flats.js
				refreshRebuts : function(gasto_t,ix){
					Vue.set(this.rebuts, ix, gasto_t);
				}
			}
		})
	}
}



function initApps(){
	initModal();

	if (r$('solapas')){
		vgk.appTabs = new Vue({
			el: "#solapas",
			data:{
		    activeTab: 1
		  }
		})
	}

	if (r$('appModo')){
		vgk.appModo = new Vue({
			el: '#appModo',
			data: { 
				random: false
			},
			methods : {
				toggle : function(){this.random = !this.random;}
			}
		})
	}
}

function resetApps(){
}