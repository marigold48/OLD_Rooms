
class FAQ extends rArbol {
	constructor(tag,nodos){
		super(tag,nodos);
		this.meta.iam = 'FAQ';
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
	}

}

function initAppsFAQ(){
	vgk.dataFAQ = {};

// define the item component
	vgk.itemFAQ = Vue.component('item', {
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
vgk.appFAQ = new Vue({
	el: '#FAQ',
		data: {
			treeData: vgk.dataFAQ
		},
	methods : {
		actualiza : function(FAQ){this.treeData = FAQ}
	}
})

} // function

//===================================================================	Show/Edit FAQ (Inventario)

function showFAQVue(){
	var vueFAQ = vgk.FAQ.reto2vue();
	vgk.appFAQ.actualiza(vueFAQ);
}
//------------------------------------------------------------------- Crear FAQ / Propietario

function addNuevoItem(id0){
	var item = new Item('Nuevo');
	var padre = vgk.FAQ.getNodoById(id0);
	vgk.FAQ.addNodoHijo(padre,item);
	showFAQVue(vgk.FAQ);
	updateFAQ();
}

function grabaNuevoItem(){
	var item = vgk.appEdit.item;

	if (vgk.appEdit.editON) vgk.FAQ.updtNodoSelf(item);
	else{ 
		alert('No es Edit??');
	}
	showFAQVue(vgk.FAQ);
	updateFAQ();
	vgk.appEdit.showModal = false;

}

function addNuevoHijo(){
	var item = vgk.appEdit.item;

	if (vgk.appEdit.editON){
		var nuevo = new Item('Nuevo');
		vgk.FAQ.addNodoHijo(item,nuevo);
	}
	else{ 
		alert('No es Edit??');
	}
	showFAQVue(vgk.FAQ);
	updateFAQ();
	vgk.appEdit.showModal = false;

}

function editItem(model){
	var item = vgk.FAQ.getNodoById(model.id0);
	vgk.appEdit.item = item;
	vgk.appEdit.edit_t = "ITEM";
	vgk.appEdit.editON = true;
	vgk.appEdit.showModal = true;
}

//------------------------------------------------------------------- CRUD FAQs MongoDB
function ecoGrabaFAQ(xhr){
	var resp = JSON.parse(xhr.responseText);
	vgk.FAQ_id = resp._id;

	if (!vgk.piso.obj.FAQ_id || vgk.piso.obj.FAQ_id == 'NdN'){
		vgk.piso.obj.FAQ_id = resp._id;
		vgk.grupo.updtNodoSelf(vgk.piso);
		console.log('ya! '+ o2s(vgk.piso));
		updateGrupo();
	}
	console.log ('Grabado nuevo FAQ: ' + resp._id);
	return false;
}

function grabaNuevoFAQ(piso){
	var raiz = new rNodo(piso.tag);
	vgk.FAQ = new FAQ('FAQ_'+piso.obj.codPiso,[raiz]);
	showFAQVue();
	vgk.FAQ.meta.org = vgk.user.org;

	var params = vgApp.paramsXHR;
	params.base = '/testRooms/';
	params.eco = ecoGrabaFAQ; 
	params.iam = 'FAQ';
	params.txt = o2s(vgk.FAQ.clase2ObjDB());
	ajaxPostTopol(params);

	vgk.appEdit.showModal = false;
}



function ecoUpdateFAQ(xhr){
	var resp = JSON.parse(xhr.responseText);
	console.log('Actualizado FAQ: ' + resp._id);
	return false;
}

function updateFAQ(){
	if (vgk.FAQ.meta.org != vgk.user.org){
		alert('FAQ sin ORG:' + vgk.FAQ.meta.org +':'+ vgk.user.org);
		vgk.FAQ.meta.org = vgk.user.org;
	};

	var params = vgApp.paramsXHR;
	params.base = '/testRooms/';
	params.eco = ecoUpdateFAQ;
	params.txt = o2s(vgk.FAQ.clase2ObjDB());
	params.topolId = vgk.FAQ_id;
	ajaxPutTopol(params);
	return false;
}

//------------------------------------------------------------------- Pick FAQ
function ecoGetUnFAQ(xhr){
		var respTxt = xhr.responseText;
		vgk.loTopol = JSON.parse(respTxt);
		vgk.FAQ_id = vgk.loTopol._id;
		vgk.FAQ = new FAQ("",[]);
		vgk.FAQ.objDB2Clase(vgk.loTopol);

		vgk.postGetUnFAQ();
}

function getUnFAQ(_id){
	vgk.FAQ_id = _id;
	var params = vgApp.paramsXHR;
	params.base = '/testRooms/';
	params.eco = ecoGetUnFAQ;
	params.topolId = _id;

	ajaxGet1Topol(params);

	return false;
}

