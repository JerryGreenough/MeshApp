async function polygonFunc(){
	if(!sessionName) return;
	let isConvexHullPolygon = document.getElementById("togglePolygonMethodButton").checked;	
	
	createLoop(isConvexHullPolygon);
	
	removeSelectionElements();
	selectionActive = false;
}


