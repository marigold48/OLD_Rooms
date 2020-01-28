// rooms_FSM.js

/* La "Máquina de Estados Finita", FSM (del inglés "Finite State Machine"),
 ó "Automata" para Rooms, modeliza las fases de un contrato de alquiler de una habitación
 y el estado de dicha habitación

Bloqueado  (BLOK) Contrato especial "de Bloqueo". Impide nuevas reservas

El Automata tiene los siguientes estados(Nodos_FSM)
	Room:
		Disponible (FREE)
		Pendiente  (STBY)
		Alquilado  (RENT)

		Bloqueado  (BLOK)

	Pacto:
		Nuevo      (_NEW)
		Propuesto  (ENQR)
		Rechazado  (DENY)
		Reservado  (BOOK)
		Expirado   (LATE)
		Pendiente  (STBY)
		Alquilado  (RENT)
		Terminado  (_END)
		Cancelado  (CANC)



	Y las transiciones (Arcos_FSM):

	Rsva -------> Transicion -----> Rsva / Room
	_NEW --> Proponer (ENQUIRY) --> ENQR / STBY : Nuevo contrato
	ENQR --> Denegado (DECLINE) --> DENY / FREE : Propietario no acepta la petición de reserva
	ENQR --> Aceptado (ACCEPTD) --> BOOK / STBY : Propietario acepta la petición de reserva
	BOOK --> Expirado (EXPIRED) --> LATE / FREE : Inquilino no ha confirmado en 48 horas
	BOOK --> Confirma (CONFIRM) --> STBY / STBY : Inquilino ha confirmado (transferencia)
	STBY --> Contrato (CHECKIN) --> RENT / RENT : Inquilino firma contrato y entra al piso
	STBY --> Problema (PROBLEM) --> PROB / FREE : Inquilino no contrata, por algún problema
	RENT --> Checkout (CHEKOUT) --> _END / FREE : Inquilino marcha, y se liquida la fianza.
	RENT --> Cancelar (CANCEL2) --> CANC / FREE : Inquilino marcha antes de lo pactado.

*/

class Nodo_FSM extends rNodo{
	constructor(tag,cod){
		super(tag);
		this.iam = 'Nodo_FSM';
		this.cod = cod;
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = 'Nodo_FSM';
		this.cod = objDb.cod;
	}
}

class Arco_FSM extends rArco{
	constructor(nodo0,nodo1,tag,cod){
		super(nodo0,nodo1);
		this.tag = tag;
		this.iam = 'Arco_FSM';
		this.cod = cod;
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = 'Arco_FSM';
		this.cod = objDB.cod;
	}
}

class Automata extends rGrafo {
	constructor(nombre,nodos,arcos){
		super(nombre,nodos,arcos);
		this.iam = 'Automata';

		this.state = ''; // es un Nodo_FSM
		this.indexStat = [];
		this.indexTran = [];

		this.optimizaStatTrans();
	}

	optimizaStatTrans(){
		this.nodos.map(function(stat){
			this.indexStat.push(stat.cod)
		}.bind(this))

		this.arcos.map(function(trans){
			this.indexTran.push(trans.cod)
		}.bind(this))
	}

// No necesario, porque no se guarda en BD (de momento)
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = 'Automata';
	}

	setState(codStat){
		var ixStat = this.indexStat.indexOf(codStat);
		if (ixStat == -1){alert('Codigo Estado erróneo'); return false;}
		this.state = this.nodos[ixStat];
	}

	getState(){
		return this.state;
	}

	setTransic(codTran){
		var ixTran = this.indexTran.indexOf(codTran);
		if (ixTran == -1){alert('Codigo Transición erróneo'); return false;}
		var trans = this.arcos[ixTran]
		if (trans.id0 == this.state.id0){
			this.state = this.getNodoById(trans.id1);
		}
		else (alert('Transición errónea'));
	}

	getTransOK(){
		var transOK = [];
		this.arcos.map(function(arco){
			if (arco.id0 == this.state.id0) transOK.push(arco);
		}.bind(this))
		return transOK;
	}
}

function creaFSM_Rooms(){

	var nodos = [];
	var _new = new Nodo_FSM('Nuevo','_NEW');			nodos.push(_new); 
	var enqr = new Nodo_FSM('Propuesto', 'ENQR');	nodos.push(enqr);
	var deny = new Nodo_FSM('Denegado ', 'DENY');	nodos.push(deny);
	var book = new Nodo_FSM('Reservado', 'BOOK');	nodos.push(book);
	var late = new Nodo_FSM('Expirado ', 'LATE');	nodos.push(late);
	var stby = new Nodo_FSM('Pendiente', 'STBY');	nodos.push(stby);
	var prob = new Nodo_FSM('Problemas', 'PROB');	nodos.push(prob); 
	var rent = new Nodo_FSM('Alquilado', 'RENT');	nodos.push(rent);
	var canc = new Nodo_FSM('Cancelado', 'CANC');	nodos.push(canc);
	var _end = new Nodo_FSM('Terminado', '_END');	nodos.push(_end);

	var arcos = [];
	var propsta = new Arco_FSM(_new,enqr,'Proponer','ENQUIRY'); arcos.push(propsta);  // Se realiza peticion reserva
	var rechaza = new Arco_FSM(enqr,deny,'Rechazar','REFUSED'); arcos.push(rechaza);  // Propietario rechaza petición
	var reserva = new Arco_FSM(enqr,book,'Reservar','BOOKING'); arcos.push(reserva);  // Propietario acepta reserva
	var toolate = new Arco_FSM(book,late,'Expirado','EXPIRED'); arcos.push(toolate);  // Expira plazo 48 horas. Se libera habitación
	var confirm = new Arco_FSM(book,stby,'Confirma','CONFIRM');	arcos.push(confirm);  // Inquilino confirma (transferencia)
	var problem = new Arco_FSM(stby,prob,'Problema','PROBLEM'); arcos.push(problem);  // Inquilino no firma contrato por alguna causa
	var contrat = new Arco_FSM(stby,rent,'Contrata','CHECKIN'); arcos.push(contrat);  // Inquilino firma contrato y entra al piso
	var termina = new Arco_FSM(rent,_end,'Checkout','CHEKOUT'); arcos.push(termina);  // Termina contrato. Se libera habitación
	var cancela = new Arco_FSM(rent,canc,'Cancelar','CANCELA');	arcos.push(cancela);  // Inquilino marcha antes del fin del contrato.

	var fsm = new Automata('Rooms FSM',nodos,arcos);
	return fsm;
	}
