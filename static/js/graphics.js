var wfac = 0.85;
var hfac = 0.75;

let dims = calculateElementProportionalDimensions(wfac, hfac);
var containerWidth  = dims[0];
var containerHeight = dims[1];


var origin = [containerWidth/2, containerHeight/2];
var gridUnit = Math.min(containerWidth, containerHeight)/6;
var gridIncrement = 100;

var snap = true;
var snap_dist = 0.05 * gridIncrement;

var xAxisOffset = 30;
var yAxisOffset = 20;

var svg = null;
var svgx0 = null; 
var svgy0 = null;

var Tol = 40 // number of pixels within which a point is deemed to have been picked.


function adjustGridIncrement(gi){

	let fac = Math.floor(Math.log10(gi));
	gi = gi / 10**fac;
	gi = closestValue([1,2,5,10], gi);
	gi = gi * 10**fac;
	
	return gi;
}

function createSVGClient(){

	svg = d3.select(container).append("svg").attr("width", container.clientWidth-xAxisOffset).attr("height", container.clientHeight-yAxisOffset);
	svg.style("position", "absolute");
	svg.style("left", xAxisOffset);
	svg.style("top", yAxisOffset);
	svg.attr('id', 'svg');
	
	// Bind some callbacks / listeners with certain mouse events.
	defineMouseBehavior(svg);	
	
	svgx0 = document.querySelector("#svg").getBoundingClientRect().x;
    svgy0 = document.querySelector("#svg").getBoundingClientRect().y;
}

function createAxes(){
	let containerTop  = container.getBoundingClientRect().top;
	let containerLeft = container.getBoundingClientRect().left;
	let scrollBarWidth = container.offsetWidth - container.clientWidth;
	let scrollBarHeight = container.offsetHeight - container.clientHeight;
	
	var yaxis = d3.select(container).append("svg").attr("width", xAxisOffset).attr("height", container.clientHeight);
	yaxis.style("position", "fixed");
	yaxis.style("left", containerLeft+1);
	yaxis.style("top", containerTop+1);
	yaxis.attr('id', 'yaxis');
	yaxis.style('background-color', 'white');
	
	var xaxis = d3.select(container).append("svg").attr("width", container.clientWidth-xAxisOffset-1).attr("height", yAxisOffset);
	xaxis.style("position", "fixed");
	xaxis.style("left", containerLeft + 1 + xAxisOffset);
	xaxis.style("top", containerTop+2);
	xaxis.attr('id', 'xaxis');
	xaxis.style('background-color', 'white');
}

