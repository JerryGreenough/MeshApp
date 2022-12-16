var rightClickPointMenu = false;
var rightClickLineMenu = false;
var rightClickBezierMenu = false;
var rightClickBSplineMenu = false;
var rightClickSelectionMenu = false;



function createRightClickLineMenu(xpos, ypos, name, elsize){
	
	let tmpdiv = d3.select('body').append('div');
	tmpdiv.style('width', "100px")
	.style('height', "157px")
	.style('position', 'absolute')
	.style('background-color', "#F5F5DD")
	.style("left", (xpos+5).toString() + "px")
	.style("top", (ypos+5).toString() + "px")
	.style("border", "1px red solid")
	.style("border-radius", "3px")
	.attr("id", "rightClickLineMenu"); 
	
	tmpdiv.append('p').text(name).attr("class", "tbtext")
			.style("margin-top", "6px")
			.style("margin-left", "0px")
			.style("text-align", "center")
			.style("color", "black")
			.attr("id", "rcLineName");
			
	tmpdiv.append('hr').style("margin-top", "5px")
			.style("margin-left", "5px")
			.style("margin-right", "5px");
			
	tmpdiv.append('p').text("Split").attr("class", "inputText")
			.style("margin-top", "6px")
			.style("margin-left", "0px")
			.style("text-align", "center")
			.style("color", "blue");
			
	tmpdiv.append('p').text("Ratio:").attr("class", "tbtext")
			.style("margin-left", "5px")
			.style("text-align", "left")
			.style('position', 'absolute')
			.style('left', "0px")
			.style('top', "56px")
			.style("color", "black");
			
	tmpdiv.append('input')
			.attr('type', 'text')
			.style('width', '30px')
			.style("text-align", "right")
			.attr('value', 0.5)
			.attr("class", "inputText")
			.style('position', 'absolute')
			.style('left', "55px")
			.style('top', "53px")
			.attr("id", "rcSplitRatio");			
			
	tmpdiv.append('p').text("Length:").attr("class", "tbtext")
			.style("margin-left", "5px")
			.style("text-align", "left")
			.style('position', 'absolute')
			.style('left', "0px")
			.style('top', "79px")
			.style("color", "black");
			
	tmpdiv.append('input')
			.attr('type', 'text')
			.style('width', '30px')
			.style("text-align", "right")
			.attr('value', 34.2)
			.attr("class", "inputText")
			.style('position', 'absolute')
			.style('left', "55px")
			.style('top', "75px")
			.attr("id", "rcSplitLength");
			
	tmpdiv.append('p').text("Elmnt. Size").attr("class", "inputText")
			.style("margin-top", "6px")
			.style("margin-left", "0px")
			.style("color", "blue")
			.style('position', 'absolute')
			.style('top', "100px")
			.style('left', "17px");
			
	tmpdiv.append('input')
			.attr('type', 'text')
			.style('width', '30px')
			.style("text-align", "right")
			.attr('value', 70)
			.attr("class", "inputText")
			.style('position', 'absolute')
			.style('left', "33px")
			.style('top', "125px")
			.attr("id", "rcLineElementSize");
			
	d3.select("#rcSplitRatio").node().onkeydown = splitRatioFunc;
	d3.select("#rcLineElementSize").node().onkeydown = lineElsizeFunc;
	d3.select("#rcSplitLength").node().onkeydown = splitLengthFunc;
			
	rightClickLineMenu = true;
	
}

async function dbSplitLine(ratio, length){
	let HTMLHandle_point = HTMLPoints.length;
	let HTMLHandle_line	 = HTMLLines.length;
	let resp = await dbRequest(sessionName, "splitLine", {"ratio":ratio, "length":length, 
											"HTMLHandle_point":HTMLHandle_point,
											"HTMLHandle_line":HTMLHandle_line });	
	return resp;
}

async function splitLine(ratio, length){
	let resp = await dbSplitLine(ratio, length);
	
	if(resp['error']==0){
		HTMLPoints.push(null);
		HTMLLines.push(null);
		
		redrawAffectedEntities(resp);
		
	}
	
	if(rightClickLineMenu){
		rightClickLineMenu = false;
		d3.select('body').select("#rightClickLineMenu").remove();}	
}

function splitLengthFunc(event){
	if(event.key === "Enter"){
		let ok = true;
		
		let slength  = parseFloat(d3.select("#rcSplitLength").property("value"));
		if(Number.isNaN(slength)) {textBoxMessage("Invalid split length.", "red"); ok = false;}	
	
		if(ok) splitLine(null, Math.abs(slength)); }
}

function splitRatioFunc(event){
	if(event.key === "Enter"){
		let ok = true;
		
		let ratio  = parseFloat(d3.select("#rcSplitRatio").property("value"));
		if(Number.isNaN(ratio)) {textBoxMessage("Invalid split ratio.", "red"); ok = false;}	
	
		if(ok) splitLine(Math.abs(ratio), null); }
}

async function lineElsizeFunc(event){
	if(event.key === "Enter"){
		let elsize = parseFloat(d3.select("#rcLineElementSize").property("value"));
		
		let ok = true;
		
		if(Number.isNaN(elsize)) {
			textBoxMessage("Invalid element size input", "red"); 
			ok = false;}
		else if(elsize < 0) {
			textBoxMessage("Invalid element size input", "red"); 
			ok = false;}	
			
		if(ok){		
			let resp = await dbRequest(sessionName, "adjustLineElsize", {"elsize":elsize});	
			redrawAffectedEntities(resp);			
		}
		
		if(rightClickLineMenu){
			rightClickLineMenu = false;
			d3.select('body').select("#rightClickLineMenu").remove();}
	}
}

function createRightClickSelectionMenu(xpos, ypos){

	//elsize = db.Points[pts[0]].getElsize();
	elsize = defaultElementSize;
	
	let tmpdiv = d3.select('body').append('div');
	tmpdiv.style('width', "77px")
	.style('height', "130px")
	.style('position', 'absolute')
	.style('background-color', "#F5F5DD")
	.style("left", (xpos+5).toString() + "px")
	.style("top", (ypos+5).toString() + "px")
	.style("border", "1px red solid")
	.style("border-radius", "3px")
	.attr("id", "rightClickSelectionMenu"); 
	
	tmpdiv.append('p').text("Selection").attr("class", "tbtext")
			.style("margin-top", "6px")
			.style("margin-left", "0px")
			.style("text-align", "center")
			.style("color", "black")
			.attr("id", "rcTitle");
			
	tmpdiv.append('hr').style("margin-top", "5px")
			.style("margin-left", "5px")
			.style("margin-right", "5px");
			
			
	tmpdiv.append('p').text("El. Size").attr("class", "inputText")
			.style("margin-top", "6px")
			.style("margin-left", "0px")
			.style("color", "blue")
			.style('position', 'absolute')
			.style('top', "25px")
			.style('left', "12px");
			
	tmpdiv.append('input')
			.attr('type', 'text')
			.style('width', '30px')
			.style("text-align", "right")
			.attr('value', elsize.toString())
			.attr("class", "inputText")
			.style('position', 'absolute')
			.style('left', "20px")
			.style('top', "50px")
			.attr("id", "elsizeText");
			
	tmpdiv.append('p').text("Copy").attr("class", "inputText")
			.style("margin-top", "6px")
			.style("margin-left", "0px")
			.style("color", "blue")
			.style('position', 'absolute')
			.style('top', "75px")
			.style('left', "12px");
			
	tmpdiv.append('input')
			.attr('type', 'text')
			.style('width', '30px')
			.style("text-align", "right")
			.attr('value', "100, 0")
			.attr("class", "inputText")
			.style('position', 'absolute')
			.style('left', "20px")
			.style('top', "100px")
			.attr("id", "copyText");
			
	tmpdiv.node().addEventListener("keydown", selectionFunc);
	d3.select("#copyText").node().onkeydown = copyTextFunc;
	d3.select("#elsizeText").node().onkeydown = elsizeTextFunc;
			
	rightClickSelectionMenu = true;
	
}

function createRightClickPointMenu(xpos, ypos, name, elsize, userCoords){
	
	let tmpdiv = d3.select('body').append('div');
	tmpdiv.style('width', "77px")
	.style('height', "210px")
	.style('position', 'absolute')
	.style('background-color', "#F5F5DD")
	.style("left", (xpos+5).toString() + "px")
	.style("top", (ypos+5).toString() + "px")
	.style("border", "1px red solid")
	.style("border-radius", "3px")
	.attr("id", "rightClickPointMenu"); 
	
	tmpdiv.append('p').text(name).attr("class", "tbtext")
			.style("margin-top", "6px")
			.style("margin-left", "0px")
			.style("text-align", "center")
			.style("color", "black")
			.attr("id", "rcTitle");
			
	tmpdiv.append('hr').style("margin-top", "5px")
			.style("margin-left", "5px")
			.style("margin-right", "5px");
			
	tmpdiv.append('p').text("Coords").attr("class", "inputText")
			.style("margin-top", "6px")
			.style("margin-left", "0px")
			.style("text-align", "center")
			.style("color", "blue");
			
	tmpdiv.append('p').text("x:").attr("class", "tbtext")
			.style("margin-left", "5px")
			.style("text-align", "left")
			.style('position', 'absolute')
			.style('left', "0px")
			.style('top', "55px")
			.style("color", "black");
			
	tmpdiv.append('p').text("y:").attr("class", "tbtext")
			.style("margin-left", "5px")
			.style("text-align", "left")
			.style('position', 'absolute')
			.style('left', "0px")
			.style('top', "80px")
			.style("color", "black");
			
	tmpdiv.append('input')
			.attr('type', 'text')
			.style('width', '45px')
			.style("text-align", "right")
			.attr('value', userCoords[0].toString())
			.attr("class", "inputText")
			.style('position', 'absolute')
			.style('left', "20px")
			.style('top', "53px")
			.attr("id", "xval");
			
			
	tmpdiv.append('input')
			.attr('type', 'text')
			.style('width', '45px')
			.style("text-align", "right")
			.attr('value', userCoords[1].toString())
			.attr("class", "inputText")
			.style('position', 'absolute')
			.style('left', "20px")
			.style('top', "78px")
			.attr("id", "yval");
			
	tmpdiv.append('p').text("El. Size").attr("class", "inputText")
			.style("margin-top", "6px")
			.style("margin-left", "0px")
			.style("color", "blue")
			.style('position', 'absolute')
			.style('top', "105px")
			.style('left', "12px");
			
	tmpdiv.append('input')
			.attr('type', 'text')
			.style('width', '30px')
			.style("text-align", "right")
			.attr('value', elsize.toString())
			.attr("class", "inputText")
			.style('position', 'absolute')
			.style('left', "20px")
			.style('top', "130px")
			.attr("id", "elsize");
			
	tmpdiv.append('p').text("Circle").attr("class", "inputText")
			.style("margin-top", "6px")
			.style("margin-left", "0px")
			.style("color", "blue")
			.style('position', 'absolute')
			.style('top', "152px")
			.style('left', "19px");
			
	tmpdiv.append('p').text("r:").attr("class", "tbtext")
			.style("margin-left", "5px")
			.style("text-align", "left")
			.style('position', 'absolute')
			.style('left', "0px")
			.style('top', "177px")
			.style("color", "black");
			
	tmpdiv.append('input')
			.attr('type', 'text')
			.style('width', '45px')
			.style("text-align", "right")
			.attr('value', "")
			.attr("class", "inputText")
			.style('position', 'absolute')
			.style('left', "20px")
			.style('top', "177px")
			.attr("id", "circleRadiusText");
			
	tmpdiv.node().addEventListener("keydown", pointFunc);
	
	d3.select("#circleRadiusText").node().onkeydown = circleFunc;
			
	rightClickPointMenu = true;
	
}

var copyTextChanged = false;
var elsizeTextChanged = false;

async function copyTextFunc(event){ copyTextChanged = true; }
async function elsizeTextFunc(event){ elsizeTextChanged = true; }

function processCopyText(copyString){
	
	let ok = true;
	copyString = copyString.split(',');			
	translation = [];	

	copyString.forEach(ss => {
		ff = parseFloat(ss);
		translation.push(ff);
		if(Number.isNaN(ff)) {
			textBoxMessage("Invalid co-ordinate input '"+ss.trim()+"'", "red");
			ok = false;
		}
	});	

	if(!ok) translation = null;

	return translation;
}

function processElsizeText(elsizeString){
	
	let elsize = parseFloat(elsizeString);

	if(Number.isNaN(elsize)) {
		textBoxMessage("Invalid element size input", "red"); 
		elsize = null;}
	else if(elsize < 0) {
		textBoxMessage("Invalid element size input", "red"); 
		elsize = null;}	

	return elsize;
}
	

async function selectionFunc(event){
	if(event.key === "Enter") {
		
		let transformation = null;
		let elsize = null;
		
		copyString = d3.select("#copyText").property("value");
		if(copyTextChanged) transformation = processCopyText(copyString);
		
		elsizeString = d3.select("#elsizeText").property("value");
		if(elsizeTextChanged) elsize = processElsizeText(elsizeString);
				
		if(rightClickSelectionMenu || selectionActive){
			removeSelectionElements();
			rightClickSelectionMenu = false;

			d3.select('body').select("#rightClickSelectionMenu").remove();}
			
		if(elsize) {
			affectedEntities = await dbChangeElsize(elsize);
			redrawAffectedEntities(affectedEntities);	}
			
		if(transformation){
			if(transformation.length < 2) transformation.push(0.0);
			newEntities = await dbCopy(transformation);
			console.log(newEntities);
			redrawAffectedEntities(newEntities, true); }					
			
	
		copyTextChanged = false;
		elsizeTextChanged = false;
		selectionActive = false;
		dbClearSelection();
				
	}
	

	
}

async function circleFunc(event){
	if(event.key === "Enter") {
		let xUser = parseFloat(d3.select("#xval").property("value"));
		let yUser = parseFloat(d3.select("#yval").property("value"));
		let elsize = parseFloat(d3.select("#elsize").property("value"));
		
		let radius = parseFloat(d3.select("#circleRadiusText").property("value"));
		
		await dbAddCircle(elsize, [xUser, yUser], radius, HTMLCircles.length);
		
		console.log(radius);
		let [xpixel, ypixel] = userToPixel(xUser, yUser);
		let pixelRadius = radius * gridUnit / gridIncrement;
		arr = [drawCircle(xpixel, ypixel, pixelRadius, "blue")];
		arr.push([xUser, yUser]); 
		arr.push(radius);
		HTMLCircles.push(arr);	
	}
}

function pointFunc(event){
	if(event.key === "Enter") {
		
		let xpos_user = parseFloat(d3.select("#xval").property("value"));
		let ypos_user = parseFloat(d3.select("#yval").property("value"));
		let elsize = parseFloat(d3.select("#elsize").property("value"));
		
		let ok = true;
		
		if(Number.isNaN(xpos_user)) {textBoxMessage("Invalid x-coord input", "red"); ok = false;}
		if(Number.isNaN(ypos_user)) {textBoxMessage("Invalid y-coord input", "red"); ok = false;}
		if(Number.isNaN(elsize)) {
			textBoxMessage("Invalid element size input", "red"); 
			ok = false;}
		else if(elsize < 0) {
			textBoxMessage("Invalid element size input", "red"); 
			ok = false;}	
		
		
		if(ok){	
			newPointPos(xpos_user, ypos_user, elsize);		
		}
				
		if(rightClickPointMenu){
			rightClickPointMenu = false;
			d3.select('body').select("#rightClickPointMenu").remove();}
	}
	
}

function removeRightMenus(){

	if(rightClickPointMenu){
		rightClickPointMenu = false;
		d3.select('body').select("#rightClickPointMenu").remove();			
	}
	if(rightClickLineMenu){
		rightClickLineMenu = false;
		d3.select('body').select("#rightClickLineMenu").remove();			
	}
	if(rightClickBezierMenu){
		rightClickBezierMenu = false;
		d3.select('body').select("#rightClickBezierMenu").remove();			
	}
	if(rightClickBSplineMenu){
		rightClickBSplineMenu = false;
		d3.select('body').select("#rightClickBSplineMenu").remove();			
	}
	if(rightClickSelectionMenu){
		rightClickSelectionMenu = false;
		d3.select('body').select("#rightClickSelectionMenu").remove();			
	}
}


function rightMenuActive(){
	return  (rightClickPointMenu || 
			rightClickLineMenu || 
			rightClickBezierMenu || 
			rightClickBSplineMenu || 
			rightClickSelectionMenu);
			
}	




async function createSessionNameBox(){
		
	let xpos = 0.5 * container.clientWidth;
	let ypos = 0.5 * container.clientHeight;

	let tmpdiv = d3.select('body').append('div');
	tmpdiv.style('width', "100px")
	.style('height', "65px")
	.style('position', 'absolute')
	.style('background-color', "#F5F5DD")
	.style("left", (xpos).toString() + "px")				
	.style("top", (ypos).toString() + "px")
	.style("border", "1px red solid")
	.style("border-radius", "3px")
	.attr("id", "sessionNameBox"); 
	
	tmpdiv.append('p').text("Session Name").attr("class", "tbtext")
			.style("margin-top", "6px")
			.style("margin-left", "0px")
			.style("text-align", "center")
			.style("color", "black");
			
	tmpdiv.append('hr').style("margin-top", "5px")
			.style("margin-left", "5px")
			.style("margin-right", "5px");
			
	tmpdiv.append('input')
			.attr('type', 'text')
			.style('width', '80px')
			.style("text-align", "left")
			.attr('value', "")
			.attr("class", "inputText")
			.style('position', 'absolute')
			.style('left', "6px")
			.style('top', "35px")
			.attr("id", "sessionNameInput");
			
	d3.select("#sessionNameInput").node().onkeydown = sessionNameFunc;
	
}

var sessionName;
function sessionNameFunc(event){
	
	if(event.key === "Enter"){
		sessionString = d3.select("#sessionNameInput").property("value");
		if(sessionString != ""){
			sessionName = sessionString;
			d3.select("#sessionNameBox").remove();
			
			dbInitialize(sessionName);
			textBoxMessage("Mesh Generation + Convex Hull", "blue");
			textBoxMessage("Session name: " + sessionName, "blue");}
	}
}
	

async function dbInitialize(sessionName){
	let xxx = await fetch("/dbOps", {
	method: "POST",
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({"op":"open", "sessionName":sessionName })
	}).then(res => res.json());	
	
}