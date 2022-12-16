var currentSelection = [];
//
//var selectedPoint = -1;
//var selectedLine = -1;
//var selectedBezier = -1;
//var selectedBSpline = -1;
//
//function putSelectedPoint(ip) {selectedPoint = ip;}
//function putSelectedLine(ip) {selectedLine = ip;}
//function putSelectedBezier(ip) {selectedBezier = ip;}
//function putSelectedBSpline(ip) {selectedBSpline = ip;}
//
//var firstCoords, lastCoords;
//
var selectionActive = false;
var selectPoly = null;
var selectCircles = [];

function removeSelectionElements(){
	if(selectPoly) { selectPoly.remove(); selectPoly = null; }
	selectCircles.forEach(q => { q.remove(); });
	selectCircles = [];
	//currentSelection = [];
	selectionActive = false;
}

async function grabNearestPointIndex(xPosition, yPosition, e, xAxisOffset, yAxisOffset){
	
	var res = false;
	let userTol = gridIncrement * Tol / gridUnit;
	let coords  = pixelToUser(xPosition, yPosition);
	
	let resp = await findNearestPoint(coords, userTol);
	if(Object.keys(resp).includes("HTMLHandle")){	
		//putSelectedPoint(resp['HTMLHandle']);
		res = true;	
		createRightClickPointMenu(e.clientX, e.clientY, resp['name'], resp['elsize'], resp['coords']);		
	}
		
	return res;
}

async function grabNearestLineIndex(xPosition, yPosition, e){

	var res = false;
	let userTol = gridIncrement * Tol / gridUnit;
	let coords  = pixelToUser(xPosition, yPosition);
	
	let resp = await findNearestLine(coords, userTol);
	if(Object.keys(resp).includes("HTMLHandle")){		
		//putSelectedLine(resp['HTMLHandle']);
		res = true;		
		createRightClickLineMenu(e.clientX, e.clientY, resp['name'], resp['elsize']); 		
	}
		
	return res;
}

async function grabNearestItem(xPosition, yPosition, e, xAxisOffset, yAxisOffset){

	let res = false;
	

	npts = HTMLPoints.length;
	
	if(npts>0){		
		res = await grabNearestPointIndex(xPosition, yPosition, e, xAxisOffset, yAxisOffset);
	}
	
	nlns = HTMLLines.length;
	if(nlns>0 & !res){
		res = await grabNearestLineIndex(xPosition, yPosition, e);
	}
	
	nbzs = HTMLBeziers.length;
	if(nbzs>0 & !res){	
		res = await grabNearestBezierIndex(xPosition, yPosition, e);
	}
	
	nbss = HTMLBSplines.length;
	if(nbss>0 & !res){	
		res = await grabNearestBSplineIndex(xPosition, yPosition, e);
	}
	
	return res;
}



async function pointsInPolygon(polygon){
	let pointCoordinates = await getPointsInPolygon(polygon);
	
	selectionActive = true;	
	pointCoordinates.forEach(qq => 
		{ let [xp, yp] = userToPixel(qq[0], qq[1]); selectCircles.push(drawCircle(xp, yp, 4, "purple")); }) ;
	
}

async function getPointsInPolygon(polygon){	
	let resp = await dbRequest(sessionName, "pointsInPolygon", {"polygonCoords": polygon});	
	return resp['pointCoords'];
}