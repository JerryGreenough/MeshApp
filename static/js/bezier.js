async function bezierFunc() {
	if(!sessionName) return;
	let bezierDegree = d3.select("#bezierDegreeOptions").property("value");
	
	let degree = 0;
	if(bezierDegree != "Auto"){degree = parseInt(bezierDegree);}
	
	let tgl = document.getElementById("toggleBezierMethodButton");
		
	let ihtml = HTMLBeziers.length
	resp = await dbAddBezier(defaultElementSize, degree, tgl.checked, ihtml);
	
	removeSelectionElements();
	selectionActive = false;
	dbClearSelection();
	
	if(resp['error'] == 1){
		textBoxMessage("Not enough points for a Bezier curve.", "red");
		return;
	}
		
	// Draw the curve.
	
	polygonPixel = resp['polygon'].map(q=> userToPixel(q[0], q[1])); 
	renderingPixel = resp['rendering'].map(q=> userToPixel(q[0], q[1])); 
	
	let arr = [drawBezier(polygonPixel, renderingPixel), resp['polygon'], resp['rendering']];
	HTMLBeziers[ihtml] = arr;
	
	degree = resp['polygon'].length - 1;
	
	if(tgl.checked)  textBoxMessage("Calculated bezier curve by control points, degree = " + degree.toString() + ".", "green");
	if(!tgl.checked) textBoxMessage("Calculated bezier curve by interpolation, degree = " + degree.toString() + ".", "green");
	
	return;	
}





