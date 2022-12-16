async function newPointAtPixelCoordinates(xpos, ypos){
		// Create a point at pixel coordinates xpos, ypos.
		
		let userTol = gridIncrement * Tol / gridUnit;
		let [xUser, yUser] = pixelToUser(xpos, ypos);
		let resp = await findNearestPoint([xUser, yUser], userTol);
		
		if(Object.keys(resp).includes("index")) return resp['index'];
		
		if(snap){
		// Move xpos_user and ypos_user to the nearest 5.0.
		
			let ll = moveToSnap(xUser, yUser);
		
			xUser = ll[2];
			yUser = ll[3];			
		}
		
		return createPointAtUserCoordinates(xUser, yUser);	 
}

function createPoint(xPosition, yPosition){
		
	// Create a new point at svg pixel coordinates xPosition, yPosition.

	xmax = Math.max(xmax, xPosition);
	ymax = Math.max(ymax, yPosition);
		
	let [xpos_user, ypos_user] = pixelToUser(xPosition, yPosition);
	
	if(snap){
		// Move xpos_user and ypos_user to the nearest 5.0.
		
		let ll = moveToSnap(xpos_user, ypos_user);
		xPosition = ll[0];
		yPosition = ll[1];	
		xpos_user = ll[2];
		ypos_user = ll[3];			
	}
	
	return createPointAtUserCoordinates(xpos_user, ypos_user);	 
}


async function createPointAtUserCoordinates(xuser, yuser){
	let userTol = gridIncrement * Tol / gridUnit;
	let resp = await dbAddPoint([xuser, yuser], defaultElementSize, HTMLPoints.length, userTol);
	
	if(resp['index'] == null) return null;
	
	let [xpixel, ypixel] = userToPixel(xuser, yuser);
	arr = drawPoint(xpixel, ypixel, resp['name']);
	arr.push([xuser, yuser]); 
	HTMLPoints.push(arr);
	
	xuser = Math.round((xuser + Number.EPSILON) * 100) / 100;
	yuser = Math.round((yuser + Number.EPSILON) * 100) / 100;
	
	textBoxDataMessage("New Point", {"x":xuser, "y":yuser}, "green");	

	return resp['index'];
}

function updateSelectedPoint(xUser, yUser, elsize){
	
	
	// Move xUser and yUser to the nearest snap position if necessary.
	if(snap) [xPosition, yPosition, xUser, yUser] = moveToSnap(xUser, yUser);
	
	newPointPos(xUser, yUser, elsize);		
}



async function newPointPos(xUser, yUser, elsize){

	// Modify the position of the point.
	
	let affectedEntities = await dbUpdatePoint([xUser, yUser], elsize);
	
	// Update the drawing info.
	redrawAffectedEntities(affectedEntities);	
}

async function dbAddPoint(coords, elsize, ihtml, tol){
	let resp = await dbRequest(sessionName, "addPoint", {"coords":coords, "elsize":elsize, "HTMLHandle":ihtml, "tol":tol});	
	return resp;
}

async function dbUpdatePoint(coords, elsize){
	let resp = await dbRequest(sessionName, "updatePoint", {"coords":coords, "elsize":elsize});	
	return resp;
}


async function dbGetPointCoordinates(){
	let resp = await dbRequest(sessionName, "getPointCoordinates", {});	
	return resp;		
}

async function dbAddLine(pts, elsize, ihtml){
	let resp = await dbRequest(sessionName, "addLine", {"points":pts, "elsize":elsize, "HTMLHandle":ihtml});
	return resp;
}

async function dbAddBezier(elsize, degree, method, ihtml){
	let resp = await dbRequest(sessionName, "addBezier", {"HTMLHandle":ihtml, "elsize":elsize, "degree":degree, "method":method});
	return resp;
}

async function dbAddBSpline(elsize, knots, degree, method, ihtml){
	let indataDict = {"HTMLHandle":ihtml, "elsize":elsize, "degree":degree, "method":method};
	if(knots) indataDict['knots'] = knots;
	let resp = await dbRequest(sessionName, "addBSpline", indataDict);
	return resp;
}

async function dbAddCircle(elsize, center, radius, ihtml){
	let indataDict = {"HTMLHandle":ihtml, "elsize":elsize, "center":center, "radius":radius};
	let resp = await dbRequest(sessionName, "addCircle", indataDict);
	return resp;
}


async function dbAddLoop(isConvexPolygonMethod, ihtml, ishtml, elsize){
	let resp = await dbRequest(sessionName, "addLoop", {"selection":selectionActive, "convexPolygon":isConvexPolygonMethod, 
	"HTMLHandle":ihtml, "surfaceHTMLHandle":ishtml, "elsize":elsize});
	return resp;
}

async function dbClear(){
	let resp = await dbRequest(sessionName, "clear", {});	
	return resp;		
}

async function dbGetStats(){
	let resp = await dbRequest(sessionName, "getStats", {});	
	return resp;		
}

async function dbClearSelection(){
	let resp = await dbRequest(sessionName, "clear", {"selection":true});	
	return resp;		
}

async function findNearestPoint(coords, tol){
	let resp = await dbRequest(sessionName, "nearestPoint", {"tol":tol, "coords":coords});	
	return resp;
}

async function findNearestLine(coords, tol){
	let resp = await dbRequest(sessionName, "nearestLine", {"tol":tol, "coords":coords});	
	return resp;
}

async function dbCopy(translation){
	HTMLHandles = getHTMLStats()
	let resp = await dbRequest(sessionName, "copy", {"translation":translation, "HTMLHandles":HTMLHandles});	
	return resp;
}

async function dbChangeElsize(elsize){
	let resp = await dbRequest(sessionName, "changeElsize", {"elsize":elsize});	
	return resp;
}
