async function createLine(pts){		
	ihtml = HTMLLines.length;
	
	let resp = await dbAddLine(pts, defaultElementSize, ihtml);	
	let arr = drawLineAtUserCoordinates(resp['coords'][0], resp['coords'][1]);
	
	HTMLLines.push(arr);
	
	return resp['index'];
}


function drawLineAtUserCoordinates(p0, p1){
	
	let c0 = userToPixel(p0[0], p0[1]);
	let c1 = userToPixel(p1[0], p1[1]);	

	let arr = [];
	arr.push(drawLine(c0, c1));
	arr.push(p0);  
	arr.push(p1); 

	return arr;	
}


async function createLoop(isConvexHullPolygon){
	
	let resp = await dbAddLoop(isConvexHullPolygon, HTMLLines.length, HTMLSurfaces.length, defaultElementSize);
	
	if(resp['error']==1) {
		textBoxMessage("Not enough points for a loop", "red");
		return;}
	else{
		let nVertices = resp['lines'].length;
		if(isConvexHullPolygon) {
			textBoxMessage("Created convex hull polygon with " + nVertices.toString() + " vertices.", "green");}
		else{
			textBoxMessage("Created polygon with " + nVertices.toString() + " vertices.", "green");}		
	}
	
	// Draw the lines.
	
	resp['lines'].forEach(q => {
		let arr = drawLineAtUserCoordinates(q[0], q[1]);
		HTMLLines.push(arr);  }	
		);
		
	HTMLSurfaces.push([null, null]);
		
	selectionActive = false;
	dbClearSelection();
}