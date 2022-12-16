async function bSplineFunc() {
	if(!sessionName) return;
	let bSplineDegree = d3.select("#bezierDegreeOptions").property("value");
	
	let degree = 0;
	if(bSplineDegree != "Auto"){degree = parseInt(bSplineDegree);}
	
	let tgl = document.getElementById("toggleBezierMethodButton");
		
	let ihtml = HTMLBSplines.length;
	
	let knots = null;
	let knotSpecificationType = d3.select("#knotsOptions").property("value");
	if(knotSpecificationType=="User") knots = customKnots;
	
	bMethod = tgl.checked;
			
	let resp = await dbAddBSpline(defaultElementSize, knots, degree, bMethod, ihtml);
	
	removeSelectionElements();
	selectionActive = false;
	dbClearSelection();
	
	if(resp['error'] == 1){
		textBoxMessage("Not enough points for a B-Spline curve.", "red");
		return;
	}
	else if(resp['error'] == 2){
		textBoxMessage("Not enough knots for a " + degree.toString() + " degree curve.","red");
		return;
	}
		
	// Draw the curve.
	
	polygonPixel = resp['polygon'].map(q=> userToPixel(q[0], q[1])); 
	renderingPixel = resp['rendering'].map(q=> userToPixel(q[0], q[1])); 
	
	let arr = [drawBSpline(polygonPixel, renderingPixel), resp['polygon'], resp['rendering']];
	HTMLBSplines[ihtml] = arr;
	
	degree = resp['degree']
	
	if(tgl.checked)  textBoxMessage("Calculated b-spline curve by control points, degree = " + degree.toString() + ".", "green");
	if(!tgl.checked) textBoxMessage("Calculated b-spline curve by interpolation, degree = " + degree.toString() + ".", "green");
	
	return;	
}

function knotsFunc(){
	let knotSpecificationType = d3.select("#knotsOptions").property("value");
	if(knotSpecificationType=="User") {
		d3.select("#knotText").style('visibility', "visible");}
	else{
		d3.select("#knotText").style('visibility', "hidden");
	}
}

function knotsValuesFunc(event){
	let knotSpecificationType = d3.select("#knotsOptions").property("value");
	if(knotSpecificationType=="User") {
		if(event.keyCode === 13){	// Check for Enter key.		
			knotString = d3.select("#knotText").property("value");
			strArr = knotString.split(',');
			valArr = []
			strArr.forEach(q => {
				ff = parseFloat(q);
				if(isNaN(ff)){ 
					textBoxMessage("Invalid knot value '" + q + "'","red");
					return;}
				else{
					valArr.push(ff);
					}
			});
			customKnots = valArr.sort(function(a,b) {return a-b;});
			textBoxMessage("Custom knots: " + valArr.toString(),"blue");
			d3.select("#knotText").property('value', valArr.toString());
			d3.select("#knotText").style('visibility', "hidden"); }
	}
}

