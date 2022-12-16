function pixelToUser(xpos, ypos){
	
	let xpos_user =  gridIncrement * (xpos - origin[0]) / gridUnit;
	let ypos_user = -gridIncrement * (ypos - origin[1]) / gridUnit;
	
	return [xpos_user, ypos_user];
}


function userToPixel(xpos_user, ypos_user){
	
	let xpos =  (gridUnit * xpos_user) / gridIncrement  + origin[0];
	let ypos = -(gridUnit * ypos_user) / gridIncrement  + origin[1];
	
	return [xpos, ypos];
}

// Helper function to get an element's exact position
function getPosition(el) {
  var xPos = 0;
  var yPos = 0;
 
  while (el) {
    if (el.tagName == "BODY") {
      // deal with browser quirks with body/window/document and page scroll
      var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      var yScroll = el.scrollTop || document.documentElement.scrollTop;
 
      xPos += (el.offsetLeft - xScroll + el.clientLeft);
      yPos += (el.offsetTop - yScroll + el.clientTop);
    } else {
      // for all other non-BODY elements
      xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      yPos += (el.offsetTop - el.scrollTop + el.clientTop);
    }
 
    el = el.offsetParent;
  }
  return {
    x: xPos,
    y: yPos
  };
}







function range(low, highPlusOne){	
	let list = [];
	for (let i = low; i <  highPlusOne; i++) list.push(i);
	return list
}


function calculateElementProportionalDimensions(wfac, hfac){
	
	let containerWidth = window.innerWidth * wfac;
	containerWidth = Math.round((containerWidth + Number.EPSILON) * 1);		
	
	let containerHeight = window.innerHeight * hfac;
	containerHeight = Math.round((containerHeight + Number.EPSILON) * 1);	
	
	return [containerWidth, containerHeight];
}

function stringFromPoints(coordList){
	
	var strng = "";

	coordList.forEach(addCoordText);
	
	function addCoordText(xytup){
		strng += Math.round(xytup[0]) + ',' + Math.round(xytup[1]) + ' ';
	}

	return strng;	
}



function textBoxMessage(strng, colorString){
	let tbp = d3.select("#textBox").append("p");
	tbp.text(strng).attr("class", "tbtext").style("color", colorString);
	let tb = document.getElementById('textBox');
	tb.scrollTop = tb.scrollHeight + 100;	
}

function textBoxDataMessage(introStrng, dict, colorString){
	
	let tbp = d3.select("#textBox").append("p");
	let strng = introStrng + ":";
	
	for (const [key, value] of Object.entries(dict)){
		strng = strng + ' ' + key.toString() + ": " + value.toString();
	}
	
	tbp.text(strng).attr("class", "tbtext").style("color", colorString);	
	let tb = document.getElementById('textBox');
	tb.scrollTop = tb.scrollHeight + 100;
}



function resizeTopMenu(wfac){

	let textBox = document.querySelector("#textBox");
	
	let hoff = window.innerHeight - textBox.getBoundingClientRect().bottom;
	let roff = window.outerWidth - window.innerWidth + 1;
	if(hoff>=0) roff = 0;
	
	let rloc = window.innerWidth * (1.0-wfac) - roff;
	pcString = rloc.toString() + "px";
	d3.select("#topMenu").style('right', pcString);

}

function resizeTextBox(wfac){
	
	let containerWidth = window.innerWidth * wfac;
	
	let container = document.querySelector("#contentContainer");
	
	let containerBottom = container.getBoundingClientRect().bottom;
	let textBoxTop = containerBottom + 10;
	let newlocString = (textBoxTop).toString() + 'px';
	
	d3.select("#textBox").style("top", newlocString).style("width", containerWidth.toString() + "px") ;
}


function repositionSwitch(wfac){
	
	let hoff = window.innerHeight - textBox.getBoundingClientRect().bottom;
	let roff = window.outerWidth - window.innerWidth + 1;
	if(hoff>=0) roff = 0;
	
	roff = 0;
	
	//let rloc = window.innerWidth * wfac + roff;
	let rloc = textBox.getBoundingClientRect().right + 10;
	pcString = rloc.toString() + "px";
	d3.select("#toggle").style('left', pcString);
	
}

function addText(context, txtstr, xPosition, xjust, yPosition, yjust, color){
	
	txtElem = context.append("text").text(txtstr).style("font-size", "12px").style("font-family", "monospace");
	
	twidth  = txtElem.node().getBBox().width;
	theight = txtElem.node().getBBox().height;
	
	let xpos = xPosition;
	let ypos = yPosition - theight/4;
	
	if(xjust == 'right') xpos -= twidth;
	if(xjust == 'mid') xpos -= twidth/2;
	
	if(yjust == 'top') ypos += theight;
	if(yjust == 'mid') ypos += theight/2;

	txtElem.attr("x", xpos).attr("y", ypos).style('fill', color);	
	
	return txtElem;
}

function resizeAxes(xAxisOffset, yAxisOffset){
	
	let xaxis = d3.select("#xaxis");
	let yaxis = d3.select("#yaxis");
	let svg   = d3.select("#svg");

	yaxis.attr("height", parseInt(svg.style("height")) + yAxisOffset);
	xaxis.attr("width", parseInt(svg.style("width")));	
	
	yaxis.attr("height", container.clientHeight);
	xaxis.attr("width", container.clientWidth - xAxisOffset - 1);
}

function pointsToTheFront(){
	
	HTMLPoints.forEach(q => {	
		let txtstr = q[1].text();
		
		q[0].remove();		
		q[1].remove();
		
		pixelCoords = userToPixel(q[2][0], q[2][1]);
		
		[q[0], q[1]] = drawPoint(pixelCoords[0], pixelCoords[1], txtstr);

	});
	
}

function moveToSnap(xpos_user, ypos_user){
	
	// Snap to the nearest 20th of a grid increment.
	
	xpos_user = Math.round(xpos_user * 20.0/gridIncrement) * snap_dist;
	ypos_user = Math.round(ypos_user * 20.0/gridIncrement) * snap_dist;
	ll = userToPixel(xpos_user, ypos_user);
	ll.push(xpos_user);
	ll.push(ypos_user);	
	
	return ll;
}

function closestValue(arr, refValue){

	let closest = arr.reduce(function(prev, curr) {
		return (Math.abs(curr - refValue) < Math.abs(prev - refValue) ? curr : prev);
	});
	
	return closest;
}

function getTextDimensions(pp) {
  
    // pp is a paragraph element
	
    text = document.createElement("span");
    document.body.appendChild(text);

    text.style.font = pp.style.font;
    text.style.fontSize = pp.style.fontSize;
    text.style.height = 'auto';
    text.style.width = 'auto';
    text.style.position = 'absolute';
    text.style.whiteSpace = 'no-wrap';
	
    text.innerHTML = pp.textContent;

    width = Math.ceil(text.clientWidth);
    formattedWidth = width;
	
	height = Math.ceil(text.clientHeight);
    formattedHeight = height;

    document.body.removeChild(text);
	
	return [formattedWidth, formattedHeight]
}		
		
		
async function dbRequest(sessionName, op, inputDict){
	
	let outputDict = await fetch("/dbOps", {
		method: "POST",
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({...{"op":op, "sessionName":sessionName }, ...inputDict})
	}).then((response) => {return response.json();});	

	
		
	return outputDict;
}	

async function dbRequestNonJSON(sessionName, op, inputDict){
	
	let outputDict = await fetch("/dbOps", {
		method: "POST",
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({...{"op":op, "sessionName":sessionName }, ...inputDict})
	});		
		
	return outputDict;
}	



function scrollFunc() {
	if(!sessionName) return;
	xoff = svgx0 - document.querySelector("#svg").getBoundingClientRect().x;
	yoff = svgy0 - document.querySelector("#svg").getBoundingClientRect().y;
	
	d3.select("#yaxis").selectAll("svg text").each(
		function(p,j){
			ynew = d3.select(this).attr('y') - yoff;
			d3.select(this).attr('y', ynew);			
		})
	svgy0 -= yoff;
	
	
	d3.select("#xaxis").selectAll("svg text").each(
		function(p,j){
			xnew = d3.select(this).attr('x') - xoff;
			d3.select(this).attr('x', xnew);			
		})
	svgx0 -= xoff;
	
}

async function clearFunc() {
	if(!sessionName) return;
	d3.select("svg").selectAll('*').remove();	
	d3.select(container).selectAll('p').remove();		
	
	textBoxMessage("Clearing all elements...", "green");
	
	clearDrawingElements();
	
	d3.select('#xaxis').selectAll('*').remove();	
	d3.select('#yaxis').selectAll('*').remove();	
	drawGridLines(origin, gridUnit, gridIncrement, xAxisOffset, yAxisOffset);
	
	await dbClear();
}


async function summaryfunc() {
	if(!sessionName) return;
	
	let resp = await dbRequest(sessionName, "getStats", {});	
	
	textBoxMessage("Summary", "blue");
	textBoxMessage("-------", "blue");
	
	textBoxMessage("Number of points: " + resp['numPoints'], "green");
	textBoxMessage("Number of lines: " + resp['numLines'], "green");
	textBoxMessage("Number of Bezier curves: " + resp['numBeziers'], "green");
	textBoxMessage("Number of loops: " + resp['numLoops'], "green");
	textBoxMessage("Number of surfaces: " + resp['numSurfaces'], "green");
	textBoxMessage("Number of nodes: " + resp['numNodes'], "green");
	textBoxMessage("Number of elements: " + resp['numElements'], "green");
	
	url = "Output/" + sessionName;
	target = "_blank";
	
	// Output the nodes and elements to a pop-up window.
	
	await dbRequestNonJSON(sessionName, "meshReport", {}).then(res => {var win = window.open(url, target, `width=400,height=300`);});	
	

}

