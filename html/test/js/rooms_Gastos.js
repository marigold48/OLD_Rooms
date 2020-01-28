//------------------------------------------------------------------- Carga Gastos BD sqlite
function ecoGastosSQLite(xhr){
	var lins = xhr.responseText.split('\n');
	var linErr = lins.splice(-2,1);
	if (linErr != '[error:0]') return false;
	var caps = (lins.splice(0,1)[0]).toLowerCase();

	var filas = [];
	lins.map(function(lin){
		var fila = csv2obj(caps,lin);
		if (fila) filas.push(fila);
	})
	creaArbolGastos(filas);
}

function getGastosSQLite(){
	var url = vgk.urlServer+':'+vgk.portNode;
	var xhr = getXHR('POST',url +'/shell/sqlite/', ecoGastosSQLite);

	var stmt = 'select fecha_op,concepto,importe from JAR_2017 ';
	stmt += 'where concepto like "R/%";'

	var stmtB64 = Base64.encode(stmt);

	xhr.send('{"id":1234567,"db":"Gastos_StPau.sqlite","path":"TallerRooms/sqlite","stmt":"'+ stmtB64 +'"}');

}

function ecoPagosSQLite(xhr){
	var lins = xhr.responseText.split('\n');
	var linErr = lins.splice(-2,1);
	if (linErr != '[error:0]') return false;
	var caps = (lins.splice(0,1)[0]).toLowerCase();

	var filas = [];
	lins.map(function(lin){
		var fila = csv2obj(caps,lin);
		if (fila) filas.push(fila);
	})
	creaArbolPagos(filas);
}

function getPagosSQLite(){
	var url = vgk.urlServer+':'+vgk.portNode;
	var xhr = getXHR('POST',url +'/shell/sqlite/', ecoPagosSQLite);
	
	var stmt = 'select fecha_op,concepto,importe from JAR_2017 ';
	stmt += 'where concepto like "TRANSF CTA DE:%";'

	var stmtB64 = Base64.encode(stmt);

	xhr.send('{"id":1234567,"db":"Gastos_StPau.sqlite","path":"TallerRooms/sqlite","stmt":"'+ stmtB64 +'"}');
}

//------------------------------------------------------------------- Pegar CSV Gastos/Pagos

function obtenerTextoEnComillas(txt) {
	const regex = /"([^"]*)"|'([^']*)'/g;
  var resultado = [];
	while ((grupo = regex.exec(txt)) !== null) {
		//si coincide con comillas dobles, el contenido estará en el
		//   grupo[1], con el grupo[2] undefined, y viceversa
		resultado.push(grupo[1] || grupo[2]);
    }
    
    //resultado es un array con todas las coincidencias
    // mostramos los valores separados con saltos de línea
    return resultado;
}

//------------------------------------------------------------------- Prepegado
// Se invoca al "paste" del clipboard(ctrl-V, etc)
// Se determina si proviene de html de la consulta online, o de un texto .csv
// Si no es de html, hay que extraer las cantidades de números con decimales, que llevan ','
// Estos números van entre comillas, y hay que cambiar las comas por puntos
// Entonces se hace el split(',')

function prePegado(e){
	var clipboardData, pastedData;

	// Stop data actually being pasted into div
	e.stopPropagation();
	e.preventDefault();

	// Get pasted data via clipboard API
	clipboardData = e.clipboardData || window.clipboardData;
	pastedData = clipboardData.getData('Text');
	// Do whatever with pasteddata

	var linsOK = [];
	var lineas = pastedData.split('\n');
	lineas.map(function(lin){
		var cols = lin.split('\t'); // si esta delimitado por \t es html
		if (cols.length != 5){
			console.log('1:'+ lin);
			linComillas = obtenerTextoEnComillas(lin);
			linComillas.map(function(numComa){
				var numPunt = numComa.replace(',','.');
				lin = lin.replace('"'+numComa+'"',numPunt);
			})
			console.log('2:'+ lin);
			cols = lin.split(',');
		} 
		var colsOK = cols.splice(1,3);
		linsOK.push(colsOK.join('|'));

	})
	var txt = linsOK.join('\n');
	alert(txt);
	vgk.appImport.actualiza(txt);
}
function importarMovs(){
	alert(vgk.appImport.csv);
}