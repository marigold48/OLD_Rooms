
class Usuario extends rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'Usuario';
		this.obj = {
			user : '',
			mail : '',
			clau : ''

		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}

}

// Un usario y un propietario se "ligan" mediante el _id del Grupo y el id0 del nodoOwner

//------------------------------------------------------------------- Persona

class Persona extends rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'Persona';
		this.obj = {
			nombre : '',
			apell : '',
			email : '',
			telef : ''

		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}

}

//------------------------------------------------------------------- Inquilino
class Inquilino extends Persona {
	constructor(tag){
		super(tag);
		this.iam = 'Inquilino';
		this.obj.genero = 'Sr';
		this.obj.pais = '';
		this.obj.direcc = '';
		this.obj.idCard = 'NIF ';
		this.obj.centro = '';
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = 'Inquilino';
		this.obj = objDB.obj;
	}
}




