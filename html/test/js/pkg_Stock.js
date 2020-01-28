
/*
 Un inventario  (Stock) es el conjunto de Items que hay almacenados en un espacio
 El piso es un Item que contiene otros Items (habitaciones, pasillos, etc)
 Los muebles son Items que pueden contener Items. (Armarios, cómodas, mesillas, etc)
 Un Item se relaciona con 'su padre' por la posición: 
 	+ Flexo 'sobre' mesa
 	+ Cuadro 'cuelga [de]' pared
 	+ Cojín 'sobre' Sofá
 	+ Lámpara 'cuelga [de]' techo
 	+ Cajón 'parte [de]' mesa

Los Items pueden tener informado el campo 'Factura', que detallaría la compra del Item

 Hay Items especiales 'Chismes' que tienen : Marca, Modelo, Num serie, y manual (PDF).

 Son electrodomésticos :
 	+ Nevera
 	+ Microondas
 	- Lavavajillas
 	+ Lavadora
 	+ etc etc

 	O aparatos electrónicos :
 	+ Televisor
 	+ Reproductor DVD
 	+ Equipo Hi-Fi
 	+ Ordenador
 	+ Router WiFi
*/

class Stock extends rArbol {
	constructor(tag,nodos){
		super(tag,nodos);
		this.meta.iam = 'Stock';
	}

	nodo2vue(nodo,vueObj){
		vueObj.id0 = nodo.id0;
		vueObj.tag = nodo.tag;
		vueObj.iam = nodo.iam;
		if (nodo.iam == 'Item' && nodo.obj.descrip.length>0) vueObj.descrip = '('+nodo.obj.descrip+')';
		vueObj.hijos = [];
		var n = nodo.hijos.length;
		if (!n) return;
		for (var i=0;i<n;i++){
			var nodoH = this.getNodoById(nodo.hijos[i]);
			var vueH = {};
			this.nodo2vue(nodoH,vueH);
			vueObj.hijos.push(vueH);
		}
	}

	reto2vue(){
		var vueObj = {};
		var raiz = this.nodos[0];
		this.nodo2vue(raiz,vueObj);
		return vueObj;
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.meta.iam = objDB.meta.iam;
		this.meta.org = objDB.meta.org;
	}

}

class Factura extends rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'Factura';
		this.obj = {
			provd: '',
			fecha:'', // string dd/mm/aaaa
			numFra:'',
			euros:'',
			PDF : ''  // link a documento PDF
		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}
}

class Item extends rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'Item';
		this.obj = {
			tipo: '',
			posic:'',
			descrip:'',
			factura:'', // new Factura
			estado : 'OK'
		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}
}

class Chisme extends Item {
	constructor(tag){
		super(tag);
		this.iam = 'Chisme';
		this.obj = {
			marca  : '',
			modelo : '',
			serie  : '',
			manual : '' // link a un documento PDF
		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}
}

function initAppsStock(){
	vgk.dataStock = {};

// define the item component
	vgk.itemStock = Vue.component('item', {
		template: '#item-template',
		props: {
			model: Object
		},
		data: function () {
			return {
				open: false
			}
		},
		computed: {
			isFolder: function () {
				return this.model.hijos && this.model.hijos.length;
			}
		},
		methods: {
			toggle: function () {
				if (this.isFolder) this.open = !this.open;
			},
			changeType: function () {
				if (!this.isFolder) {
					Vue.set(this.model, 'hijos', []);
						this.addChild();
						this.open = true;
					}
				},
			addChild: function () {
				addNuevoItem(this.model.id0);
			},
			editItem: function () {
				editItem(this.model);
			}
		} // methods
	}) // Vue.component

// boot up the demo
vgk.appStock = new Vue({
	el: '#stock',
		data: {
			treeData: vgk.dataStock
		},
	methods : {
		actualiza : function(stock){this.treeData = stock}
	}
})

} // function

//===================================================================	Show/Edit Stock (Inventario)

function showStockVue(){
	var vueStock = vgk.stock.reto2vue();
	vgk.appStock.actualiza(vueStock);
}
//------------------------------------------------------------------- Crear Stock / Propietario

function addNuevoItem(id0){
	var item = new Item('Nuevo');
	var padre = vgk.stock.getNodoById(id0);
	vgk.stock.addNodoHijo(padre,item);
	showStockVue(vgk.stock);
	updateStock();
}

function grabaNuevoItem(){
	var item = vgk.appEdit.item;

	if (vgk.appEdit.editON) vgk.stock.updtNodoSelf(item);
	else{ 
		alert('No es Edit??');
	}
	showStockVue(vgk.stock);
	updateStock();
	vgk.appEdit.showModal = false;

}

function addNuevoHijo(){
	var item = vgk.appEdit.item;

	if (vgk.appEdit.editON){
		var nuevo = new Item('Nuevo');
		vgk.stock.addNodoHijo(item,nuevo);
	}
	else{ 
		alert('No es Edit??');
	}
	showStockVue(vgk.stock);
	updateStock();
	vgk.appEdit.showModal = false;

}

function editItem(model){
	var item = vgk.stock.getNodoById(model.id0);
	vgk.appEdit.item = item;
	vgk.appEdit.edit_t = "ITEM";
	vgk.appEdit.editON = true;
	vgk.appEdit.showModal = true;
}

//------------------------------------------------------------------- CRUD Stocks MongoDB
function ecoGrabaStock(xhr){
	var resp = JSON.parse(xhr.responseText);
	vgk.stock_id = resp._id;

	if (!vgk.piso.obj.stock_id || vgk.piso.obj.stock_id == 'NdN'){
		vgk.piso.obj.stock_id = resp._id;
		vgk.grupo.updtNodoSelf(vgk.piso);
		console.log('ya! '+ o2s(vgk.piso));
		updateGrupo();
	}
	console.log ('Grabado nuevo stock: ' + resp._id);
	return false;
}

function grabaNuevoStock(piso){
	var raiz = new rNodo(piso.tag);
	vgk.stock = new Stock('Stock_'+piso.obj.codPiso,[raiz]);
	showStockVue();
	vgk.stock.meta.org = vgk.user.org;

	var params = vgApp.paramsXHR;
	params.base = '/testRooms/';
	params.eco = ecoGrabaStock; 
	params.iam = 'Stock';
	params.txt = o2s(vgk.stock.clase2ObjDB());
	ajaxPostTopol(params);

	vgk.appEdit.showModal = false;
}



function ecoUpdateStock(xhr){
	var resp = JSON.parse(xhr.responseText);
	console.log('Actualizado stock: ' + resp._id);
	return false;
}

function updateStock(){
	if (vgk.stock.meta.org != vgk.user.org){
		alert('Stock sin ORG:' + vgk.stock.meta.org +':'+ vgk.user.org);
		vgk.stock.meta.org = vgk.user.org;
	};

	var params = vgApp.paramsXHR;
	params.base = '/testRooms/';
	params.eco = ecoUpdateStock;
	params.txt = o2s(vgk.stock.clase2ObjDB());
	params.topolId = vgk.stock_id;
	ajaxPutTopol(params);
	return false;
}

//------------------------------------------------------------------- Pick Stock
function ecoGetUnStock(xhr){
		var respTxt = xhr.responseText;
		vgk.loTopol = JSON.parse(respTxt);
		vgk.stock_id = vgk.loTopol._id;
		vgk.stock = new Stock("",[]);
		vgk.stock.objDB2Clase(vgk.loTopol);

		vgk.postGetUnStock();
}

function getUnStock(_id){
	vgk.stock_id = _id;
	var params = vgApp.paramsXHR;
	params.base = '/testRooms/';
	params.eco = ecoGetUnStock;
	params.topolId = _id;

	ajaxGet1Topol(params);

	return false;
}

