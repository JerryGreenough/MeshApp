var isLeftDown = false;
var isMiddleDown = false;
var isRightDown = false;
var isMoved = false;
var isUnderway = false;


function getClickPositionPixelCoordinates(e) {

//  e is a pointer event
	
	let drec = document.querySelector("#svg").getBoundingClientRect();
	
	let xPosition = e.clientX - drec.left;
    let yPosition = e.clientY - drec.top;	
	
	return [xPosition, yPosition];}
	
	
	
function processLeftClickBehavior(e){
	
	e.preventDefault();  //Prevent the dafault (browser) menu from appearing.
	
	[xPosition, yPosition] = getClickPositionPixelCoordinates(e);
	
	isUnderway = true;
	
	if(rightClickPointMenu){
		// Update point by click.
		
		let elsize = parseFloat(d3.select("#elsize").property("value"));	
		let [xUser, yUser] = pixelToUser(xPosition, yPosition);
		
		updateSelectedPoint(xUser, yUser, elsize);
		removeRightMenus();	
	}
	else if(rightMenuActive()){
		removeSelectionElements();
		removeRightMenus();	
	}
	else if(selectPoly){
		if(!isMoved) removeSelectionElements(); // Cancelation of selection by left mouse click.
	}
	else{
		// Create a point.	
		newPointAtPixelCoordinates(xPosition, yPosition);
	}
}


var eclientXPrev = 0;
var eclientYPrev = 0;


function processRightClickBehavior(e){
	
	e.preventDefault();  //Prevent the dafault (browser) menu from appearing.
	
	isUnderway = true;
	
	if(rightMenuActive()){
		removeSelectionElements();
		removeRightMenus();	}
	else if(selectPoly){
		if(selectionActive) {
			createRightClickSelectionMenu(e.clientX, e.clientY);}
		else{
			// Nothing selected.
			if(!isMoved) removeSelectionElements();
		}
	}
	else{
		let [xPosition, yPosition] = getClickPositionPixelCoordinates(e);
		
		let repeat = false;
		if((e.clientX== eclientXPrev) && (e.clientY == eclientYPrev)) repeat = true;
		
		eclientXPrev = e.clientX;
		eclientYPrev = e.clientY;
		let res = false;
		if(!repeat){
			res = grabNearestItem(xPosition, yPosition, e, xAxisOffset, yAxisOffset);	}
		
		if(!res) removeRightMenus();
	}
}	
	
function defineMouseBehavior(svg){
	
	svg.on("click", function(event){	
		if(!sessionName) return;
		processLeftClickBehavior(event);			
	})
	.on("contextmenu", function(event){
		if(!sessionName) return;
		processRightClickBehavior(event); 
	})	
	.on("mousedown", function(event){
		if(!sessionName) return;
		isMoved = false;
		
		let isDown = isLeftDown || isMiddleDown || isRightDown;
		if(!isDown) firstCoords = d3.pointer(event, this);
		
		if(event.button==0) isLeftDown = true;
		if(event.button==1) isMiddleDown = true;
		if(event.button==2) isRightDown = true;
        })
		
    .on("mousemove", function(event){
		if(!sessionName) return;
		event.preventDefault();  //Prevent the dafault (browser) menu from appearing.
		
		let isDown = isLeftDown || isMiddleDown || isRightDown;
		
        if(isDown && isUnderway) {
			removeRightMenus();
			//currentSelection = []; 
	
			lastCoords = d3.pointer(event, this);
			if(selectPoly && !isMoved) removeSelectionElements(); 
								
			updateSelectionPolygon(firstCoords, lastCoords, "green"); }
			
		isMoved = true;
    })
		
    .on("mouseup", function(event){
		if(!sessionName) return;
		if(isMiddleDown){		
			lastCoords = d3.pointer(event, this);
			
			if(isMoved && isUnderway){				
				let polygon = determineSelectionPolygon(firstCoords, lastCoords);
				updateSelectionPolygon(firstCoords, lastCoords, "orange"); }
				
			isMiddleDown = false;
		}
		
		if(isRightDown){			
			lastCoords = d3.pointer(event, this);
			
			if(isMoved && isUnderway){				
				let polygon = determineSelectionPolygon(firstCoords, lastCoords);
				updateSelectionPolygon(firstCoords, lastCoords, "orange"); }
				
			isRightDown = false;
		}
		
		if(isLeftDown) {
			lastCoords = d3.pointer(event, this);
		
			if(isMoved && isUnderway){	
				let polygon = determineSelectionPolygon(firstCoords, lastCoords);	
				polygon = polygon.map(q => pixelToUser(q[0], q[1]));
				pointsInPolygon(polygon);				
				updateSelectionPolygon(firstCoords, lastCoords, "orange");  }
				
			isLeftDown = false;
		}
				
        
    });     

}

function determineSelectionPolygon(fc, lc){
	
	let x0 = Math.min(fc[0], lc[0]);
	let y0 = Math.min(fc[1], lc[1]);
	let width  = Math.abs(lc[0] - fc[0]);
	let height = Math.abs(lc[1] - fc[1]);
	let polygon = [[x0, y0], [x0, y0+height], [x0+width, y0+height], [x0+width, y0]];	
	
	return polygon;
}

function updateSelectionPolygon(fc, lc, color){
	if(selectPoly) selectPoly.remove();		
		
	selectPoly = svg.append('rect')
	.style('stroke', color)
	.style('stroke-width', 1)
	.style('fill', 'none')
	.attr('x', Math.min(fc[0], lc[0]))
	.attr('y', Math.min(fc[1], lc[1]))
	.attr('width', Math.abs(lc[0] - fc[0]))
	.attr('height', Math.abs(lc[1] - fc[1]));		
}

