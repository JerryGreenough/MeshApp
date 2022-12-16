var zoomFactor = 0.5;

function ZoomInfunc() {
	if(!sessionName) return;
	let factor = zoomFactor;
	let ch = containerHeight;
	let cw = containerWidth;	
	
	let newWidth = Math.abs(lastCoords[0] - firstCoords[0]);
	let newHeight = Math.abs(lastCoords[1] - firstCoords[1]);
		
	if(selectPoly){ 
		removeSelectionElements();
					
		factor = newWidth / cw;
		if((newHeight / factor) > ch) factor = newHeight / ch;
		
		// The real factor is calculated in Zoom.
		
		let gridIncrementOld = gridIncrement;
		let gridIncrementNew = gridIncrement * factor;

		gridIncrementNew = adjustGridIncrement(gridIncrementNew);
		adjustedFactor = gridIncrementNew / gridIncrementOld;
		
		let midSelection = [0.0, 0.0];
		midSelection[0] = 0.5*(firstCoords[0] + lastCoords[0]);
		midSelection[1] = 0.5*(firstCoords[1] + lastCoords[1]);		
		
		let originToMid = [0,0];
		originToMid[0] = midSelection[0] - origin[0];
		originToMid[1] = midSelection[1] - origin[1];
		
		origin[0] = 0.5*cw -(originToMid[0]) / (adjustedFactor); 
		origin[1] = 0.5*ch -(originToMid[1]) / (adjustedFactor);
		
		origin[0] -= 0.5*yAxisOffset;
		origin[1] -= 0.5*xAxisOffset;
		
		//currentSelection = [];
	}
	else{
		let gridIncrementOld = gridIncrement;
		let gridIncrementNew = gridIncrement * factor;

		gridIncrementNew = adjustGridIncrement(gridIncrementNew);
		adjustedFactor = gridIncrementNew / gridIncrementOld;
		
		origin[0] = 0.5*cw + (origin[0] - 0.5*cw) / adjustedFactor;
		origin[1] = 0.5*ch + (origin[1] - 0.5*ch) / adjustedFactor;	
	}
	
	removeRightMenus();
	Zoom(factor);
}

function ZoomOutfunc() {
	if(!sessionName) return;
	let factor = zoomFactor;
	let ch = containerHeight;
	let cw = containerWidth;
	
	let newWidth = Math.abs(lastCoords[0] - firstCoords[0]);
	let newHeight = Math.abs(lastCoords[1] - firstCoords[1]);
	
	if(selectPoly){ 
		removeSelectionElements();
		
		factor = newWidth / cw;
		if((newHeight / factor) > ch) factor = newHeight / ch;
		
		// The real factor is calculated in Zoom.
		
		let gridIncrementOld = gridIncrement;
		let gridIncrementNew = gridIncrement / factor;

		gridIncrementNew = adjustGridIncrement(gridIncrementNew);
		adjustedFactor = gridIncrementNew / gridIncrementOld;
		
		let midSelection = [0.0, 0.0];
		midSelection[0] = 0.5*(firstCoords[0] + lastCoords[0]);
		midSelection[1] = 0.5*(firstCoords[1] + lastCoords[1]);		
			
		let originToMid = [0,0];
		originToMid[0] = midSelection[0] - origin[0];
		originToMid[1] = midSelection[1] - origin[1];
		
		origin[0] = 0.5*cw -(originToMid[0]) / (adjustedFactor); 
		origin[1] = 0.5*ch -(originToMid[1]) / (adjustedFactor);

		origin[0] -= 0.5*yAxisOffset;
		origin[1] -= 0.5*xAxisOffset;		

		//currentSelection = [];
		}
	else{
		let gridIncrementOld = gridIncrement;
		let gridIncrementNew = gridIncrement / factor;
	
		gridIncrementNew = adjustGridIncrement(gridIncrementNew);
		adjustedFactor = gridIncrementOld / gridIncrementNew;
	
		origin[0] = 0.5*cw + (origin[0] - 0.5*cw) * adjustedFactor;
		origin[1] = 0.5*ch + (origin[1] - 0.5*ch) * adjustedFactor;	
	}
	removeRightMenus();	
	Zoom(1.0 / factor);
}

function Zoom(factor){
	
	d3.select("svg").selectAll('*').remove();	
	d3.select(container).selectAll('p').remove();		
	
	d3.select('#xaxis').selectAll('*').remove();	
	d3.select('#yaxis').selectAll('*').remove();
	
	gridIncrement *= factor;
	gridIncrement = adjustGridIncrement(gridIncrement);
	
	snap_dist = 0.05 * gridIncrement;
	
	drawGridLines(origin, gridUnit, gridIncrement, xAxisOffset, yAxisOffset);
	redraw();
}