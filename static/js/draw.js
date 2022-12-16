// Maximum values of model in pixel co-ordinates.

var xmax = 0;
var ymax = 0;



// Storage for d3 HTML elements.

var HTMLPoints = [];
var HTMLLines = [];
var HTMLBeziers = [];
var HTMLBSplines = [];
var HTMLLoops = [];
var HTMLSurfaces = [];
var HTMLCircles = [];

function drawNewEntities(newEntities){
	redrawAffectedEntities(newEntities, true);
}

function clearDrawingArrays(){
	HTMLPoints = [];
	HTMLLines = [];
	HTMLBeziers = [];
	HTMLBSplines = [];
	HTMLLoops = [];
	HTMLSurfaces = [];	
	HTMLCircles = [];	
}

function getHTMLStats(){
	
	resDict = {};
	
	resDict['points']   = HTMLPoints.length;
	resDict['lines']    = HTMLLines.length;
	resDict['beziers']  = HTMLBeziers.length;
	resDict['bsplines'] = HTMLBSplines.length;
	resDict['surfaces'] = HTMLSurfaces.length;
	
	return resDict;	      
}
	
function redrawAffectedEntities(affectedEntities, bNew = false){
	if('points' in affectedEntities){
		if(bNew) { blanks = Array(HTMLPoints.length, null); HTMLPoints.push(...blanks);}
		affectedEntities['points'].forEach(pp=>{
			updatePointHTML(pp[0], pp[2], pp[1]);	
		})
	}
	
	if('lines' in affectedEntities){
		if(bNew) { blanks = Array(HTMLLines.length, null); HTMLLines.push(...blanks);}
		affectedEntities['lines'].forEach(ll=>{
			updateLineHTML(ll[0], ll[1], ll[2]);	
		})
	}
	
	if('surfaces' in affectedEntities){
		if(bNew) { blanks = Array(HTMLSurfaces.length, null); HTMLSurfaces.push(...blanks);}
		affectedEntities['surfaces'].forEach(ss=>{
			updateSurfaceHTML(ss[0], ss[1]);		
		})
	}
	
	if('beziers' in affectedEntities){
		if(bNew) { blanks = Array(HTMLBeziers.length, null); HTMLBeziers.push(...blanks);}
		affectedEntities['beziers'].forEach(bz=>{
			updateBezierHTML(bz[0], bz[1], bz[2]);		
		})
	}
	
	if('bsplines' in affectedEntities){
		if(bNew) { blanks = Array(HTMLBSplines.length, null); HTMLBSplines.push(...blanks);}
		affectedEntities['bsplines'].forEach(bs=>{
			updateBSplineHTML(bs[0], bs[1], bs[2]);		
		})
	}
	
	if('circles' in affectedEntities){
		if(bNew) { blanks = Array(HTMLCircles.length, null); HTMLCircles.push(...blanks);}
		affectedEntities['circles'].forEach(cc=>{
			updateCircleHTML(cc[0], cc[1], cc[2]);		
		})
	}
}

function updateLineHTML(ihtml, pUser0, pUser1){
	let [xUser0, yUser0] = pUser0;
	let [xUser1, yUser1] = pUser1;
	let pPixel0 = userToPixel(pUser0[0], pUser0[1]);
	let pPixel1 = userToPixel(pUser1[0], pUser1[1]);
	if(HTMLLines[ihtml]) {
	if(HTMLLines[ihtml][0]) HTMLLines[ihtml][0].remove();	}
	HTMLLines[ihtml] = [drawLine(pPixel0, pPixel1), [xUser0, yUser0], [xUser1, yUser1]];
}

function updatePointHTML(ihtml, pUser, name){
	let [xUser, yUser] = pUser;
	let [xPixel, yPixel] = userToPixel(xUser, yUser);
	let arr = drawPoint(xPixel, yPixel, name);
	arr.push([xUser, yUser]);
	if(HTMLPoints[ihtml]) { 
		if(HTMLPoints[ihtml][0]) HTMLPoints[ihtml][0].remove();	
		if(HTMLPoints[ihtml][1]) HTMLPoints[ihtml][1].remove(); }
	HTMLPoints[ihtml] = arr;
}

function updateBezierHTML(ihtml, polygon, rendering){
	polygonPixel = polygon.map(q=> userToPixel(q[0], q[1])); 
	renderingPixel = rendering.map(q=> userToPixel(q[0], q[1])); 
	let arr = [drawBezier(polygonPixel, renderingPixel), polygon, rendering];
	if(HTMLBeziers[ihtml]) if(HTMLBeziers[ihtml][0]) HTMLBeziers[ihtml][0].forEach(q=>q.remove());	
	HTMLBeziers[ihtml] = arr;
}

function updateBSplineHTML(ihtml, polygon, rendering){
	polygonPixel = polygon.map(q=> userToPixel(q[0], q[1])); 
	renderingPixel = rendering.map(q=> userToPixel(q[0], q[1])); 
	let arr = [drawBSpline(polygonPixel, renderingPixel), polygon, rendering];
	if(HTMLBSplines[ihtml]) if(HTMLBSplines[ihtml][0]) HTMLBSplines[ihtml][0].forEach(q=>q.remove());	
	HTMLBSplines[ihtml] = arr;
}

function updateSurfaceHTML(ihtml, mesh){
	if(HTMLSurfaces[ihtml]) {
	if(HTMLSurfaces[ihtml][0]) HTMLSurfaces[ihtml][0].forEach(q=>q.remove()); }
	HTMLSurfaces[ihtml] = [drawSurface(mesh), mesh]
}

function updateCircleHTML(ihtml, center, radius){
	if(HTMLCircles[ihtml]) {
	if(HTMLCircles[ihtml][0]) HTMLCircles[ihtml][0].remove(); }
	let pixcoords = userToPixel(center[0], center[1]);
	let pixradius = gridUnit * radius/ gridIncrement;
	HTMLCircles[ihtml] = drawCircle(pixcoords[0], pixcoords[1], pixradius, "blue");
}

async function redraw(){

	for (const [is, q] of HTMLSurfaces.entries()) {
		redrawSurface(is); }
		
	for (const [ic, q] of HTMLCircles.entries()) {
		redrawCircle(ic); }
		
	for (const [ib, q] of HTMLBeziers.entries()) {
		redrawBezier(ib); }
		
	for (const [ib, q] of HTMLBSplines.entries()) {
		redrawBSpline(ib); }
		
	for (const [il, q] of HTMLLines.entries()) {
		redrawLine(il); }
		
	for (const [ip, q] of HTMLPoints.entries()) {
		redrawPoint(ip); }
		
}

function drawPoint(xPosition, yPosition, txtstr){
	
	newCircle = svg.append('circle')
	.attr('cx', xPosition)
	.attr('cy', yPosition)
	.attr('r', 2)
	.attr('stroke', 'black')
	.attr('fill', 'blue');
	
	let xpos = parseInt(xPosition);
	let ypos = parseInt(yPosition);
	
	newText = addText(svg, txtstr, xpos + 5, "mid", ypos - 12, "mid", "black");
	
	return [newCircle, newText];
}

function drawLine(p1, p2){
	let newLine = svg.append('line')
		.style('stroke', 'blue')
		.style('stroke-width', 1)
		.attr('x1', p1[0])
		.attr('y1', p1[1])
		.attr('x2', p2[0])
		.attr('y2', p2[1]);	

	return newLine;	
}

function drawBezier(polygon, rendering){
	let svgElements = [];
		
	svgElements = svgElements.concat(drawPolyLine(rendering, "blue"));
	svgElements = svgElements.concat(drawPolyLine(polygon, "black"));
	
	return svgElements; 
}

function drawBSpline(polygon, rendering){
	let svgElements = [];
		
	svgElements = svgElements.concat(drawPolyLine(rendering, "green"));
	svgElements = svgElements.concat(drawPolyLine(polygon, "black"));
	
	return svgElements; 
}

function drawSurface(meshData){
	return meshDraw(meshData);	
}

function drawCircle(xPosition, yPosition, radius, color){
	let newCircle = svg.append('circle')
	.attr('cx', xPosition)
	.attr('cy', yPosition)
	.attr('r', radius)
	.attr('fill', 'none')
	.attr('stroke', color);
	
	return newCircle;
}


function redrawPoint(ip){
	if(!HTMLPoints[ip]) return;
	name = HTMLPoints[ip][1].text();
	HTMLPoints[ip][0].remove();
	HTMLPoints[ip][1].remove();
	let [xUser, yUser] = HTMLPoints[ip][2];
	let [xPixel, yPixel] = userToPixel(xUser, yUser);
	
	HTMLPoints[ip] = drawPoint(xPixel, yPixel, name);
	HTMLPoints[ip].push([xUser, yUser]);
}


function redrawLine(il){
	if(!HTMLLines[il]) return;
	HTMLLines[il][0].remove();
	let [xUser0, yUser0] = HTMLLines[il][1];
	let [xUser1, yUser1] = HTMLLines[il][2];
	let pPixel0 = userToPixel(xUser0, yUser0);
	let pPixel1 = userToPixel(xUser1, yUser1);
	HTMLLines[il][0] = drawLine(pPixel0, pPixel1);
}

function redrawBezier(ib){
	if(!HTMLBeziers[ib]) return;
	if(HTMLBeziers[ib][0]) HTMLBeziers[ib][0].forEach(q=>q.remove());
	polygon = (HTMLBeziers[ib][1]).map(q=> userToPixel(q[0], q[1])); 
	rendering = (HTMLBeziers[ib][2]).map(q=> userToPixel(q[0], q[1])); 
	HTMLBeziers[ib][0] = drawBezier(polygon, rendering);
}

function redrawBSpline(ib){
	if(!HTMLBSplines[ib]) return;
	if(HTMLBSplines[ib][0]) HTMLBSplines[ib][0].forEach(q=>q.remove());
	polygon = (HTMLBSplines[ib][1]).map(q=> userToPixel(q[0], q[1])); 
	rendering = (HTMLBSplines[ib][2]).map(q=> userToPixel(q[0], q[1])); 
	HTMLBSplines[ib][0] = drawBSpline(polygon, rendering);
}

function redrawSurface(is){
	if(!HTMLSurfaces[is]) return;
	if(HTMLSurfaces[is][0]) HTMLSurfaces[is][0].forEach(q=>q.remove());
	if(HTMLSurfaces[is][1]) HTMLSurfaces[is][0] = drawSurface(HTMLSurfaces[is][1]);
}

function redrawCircle(ic){
	if(!HTMLCircles[ic]) return;
	if( HTMLCircles[ic][0]) {
		HTMLCircles[ic][0].remove();
		let pixcoords = userToPixel(HTMLCircles[ic][1][0], HTMLCircles[ic][1][1]);
		let pixradius = gridUnit * HTMLCircles[ic][2] / gridIncrement;
		HTMLCircles[ic][0] = drawCircle(pixcoords[0], pixcoords[1], pixradius, "blue"); }
}


function cancelSurfaceMesh(is){
	if(!HTMLSurfaces[is]) return;
	if(HTMLSurfaces[is][0]) HTMLSurfaces[is][0].forEach(q=>q.remove());
	HTMLSurfaces[is][0] = null;
	HTMLSurfaces[is][1] = null;
}

function clearDrawingElements(){
	for(let ip = 0; ip<HTMLPoints.length; ++ip){
		if(HTMLPoints[ip]) { HTMLPoints[ip][0].remove(); HTMLPoints[ip][1].remove(); }
	}
		
	for(let il = 0; il<HTMLLines.length; ++il){
		if(HTMLLines[il]) HTMLLines[il][0].remove();
	}
	
	for(let ib = 0; ib<HTMLBeziers.length; ++ib){
		if(HTMLBeziers[ib]) HTMLBeziers[ib][0].forEach(q=>q.remove());
	}
	
	for(let ib = 0; ib<HTMLBSplines.length; ++ib){
		if(HTMLBSplines[ib]) HTMLBSplines[ib][0].forEach(q=>q.remove());
	}
	
	for(let is = 0; is<HTMLSurfaces.length; ++is){
		if(HTMLSurfaces[is]) if(HTMLSurfaces[is][0]) HTMLSurfaces[is][0].forEach(q=>q.remove());
	}
		
	for(let ic = 0; is<HTMLCircles.length; ++ic){
		if(HTMLCircles[ic]) if(HTMLCircles[ic][0]) HTMLCircles[ic][0].remove();
	}
	clearDrawingArrays();
}


function drawPolyLine(data, color){
	let svgElements = [];
	
	if(data.length > 1){
		for(let i =0; i<data.length-1; ++i){
			newLine = svg.append('line')
			.style('stroke', color)
			.style('stroke-width', 1)
			.attr('x1', data[i][0])
			.attr('y1', data[i][1])
			.attr('x2', data[i+1][0])
			.attr('y2', data[i+1][1]);	
			svgElements.push(newLine);
		}
	}
	
	return svgElements;
}


function drawGridLines(origin, gridUnit, gridIncrement, xAxisOffset, yAxisOffset){
	
	let svg = d3.select("#svg");
	let xaxis = d3.select("#xaxis");
	let yaxis = d3.select("#yaxis");
	let color = "black";
	
	for(let i =0; i<50; ++i){
		
		val = i*gridIncrement;
		val = Math.round((val + Number.EPSILON) * 100000) / 100000;
		str = val.toString();
		addText(xaxis, str, origin[0] + gridUnit*i, "mid", 2, "top", color);
		
		svg.append('line')
		.style('stroke', "#7393B3")
		.style('stroke-width', 1)
		.style('stroke-dasharray', "5,5")
		.attr('x1', origin[0] + gridUnit*i)
		.attr('y1', 0)
		.attr('x2', origin[0] + gridUnit*i)
		.attr('y2', 2000);	

		val = -i*gridIncrement;
		val = Math.round((val + Number.EPSILON) * 100000) / 100000;
		str = val.toString();
		addText(xaxis, str, origin[0] - gridUnit*i, "mid", 2, "top", color);		
	
		svg.append('line')
		.style('stroke', "#7393B3")
		.style('stroke-width', 1)
		.style('stroke-dasharray', "5,5")
		.attr('x1', origin[0] - gridUnit*i)
		.attr('y1', 0)
		.attr('x2', origin[0] - gridUnit*i)
		.attr('y2', 2000);				
	}
	
	for(let i =0; i<50; ++i){
		
		val = -i*gridIncrement;
		val = Math.round((val + Number.EPSILON) * 100000) / 100000;
		str = val.toString();
		addText(yaxis, str, xAxisOffset - 2, "right", origin[1] + gridUnit*i + yAxisOffset, "mid", color);	
		
		svg.append('line')
		.style('stroke', "#7393B3")
		.style('stroke-width', 1)
		.style('stroke-dasharray', "5,5")
		.attr('class', 'dashed')
		.attr('x1', 0)
		.attr('y1', origin[1] + gridUnit*i)
		.attr('x2', 2000)
		.attr('y2', origin[1] + gridUnit*i);
		
		val = i*gridIncrement;
		val = Math.round((val + Number.EPSILON) * 100000) / 100000;
		str = val.toString();
		addText(yaxis, str, xAxisOffset - 2, "right", origin[1] - gridUnit*i + yAxisOffset, "mid", color);	
	
		svg.append('line')
		.style('stroke', "#7393B3")
		.style('stroke-width', 1)
		.style('stroke-dasharray', "5,5")
		.attr('class', 'dashed')
		.attr('x1', 0)
		.attr('y1', origin[1] - gridUnit*i)
		.attr('x2', 2000)
		.attr('y2', origin[1] - gridUnit*i);				
	}	
}


function resizefunc(){

	let container = document.querySelector("#contentContainer");
		
	let dims = calculateElementProportionalDimensions(wfac, hfac);
	let containerWidth  = dims[0];
	let containerHeight = dims[1];
	
	d3.select(container)
		.style("width", containerWidth.toString() + "px")
		.style("height", containerHeight.toString() + "px");
	
	resizeTextBox(wfac);

	let newSVGWidth  = Math.max(containerWidth, xmax+10);
	let newSVGHeight = Math.max(containerHeight, ymax+10);
	
	svg.style("width", newSVGWidth.toString() + "px").style("height",newSVGHeight.toString() + "px");
	
	resizeTopMenu(wfac);
	repositionSwitch(wfac);
	resizeAxes(xAxisOffset, yAxisOffset); 
	
}

