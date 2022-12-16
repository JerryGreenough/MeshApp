var defaultElementSize = 70;

async function meshFunc(){
	if(!sessionName) return;
	
	textBoxMessage("Meshing...", "green");

	let tgl = document.getElementById("toggleElementTypeButton");
	
	let resp = await dbRequest(sessionName, "meshSurface", {"quad":tgl.checked, "elsize":defaultElementSize});	

	if (resp['error'] !=0){
		textBoxMessage("A problem occurred during meshing!", "red");
		cancelSurfaceMesh(resp['HTMLHandle']);
		return;
	}
	
	sanitizeMeshData(resp);
	
	HTMLSurfaces[resp['HTMLHandle']][1] = resp;
	redrawSurface(resp['HTMLHandle']);
}

function sanitizeMeshData(data){

	if(typeof data['quadElements'] == 'undefined') data['quadElements'] = [];
	if(typeof data['triElements'] == 'undefined') data['triElements'] = [];
	if(typeof data['badquads'] == 'undefined') data['badquads'] = [];
	if(typeof data['badtris'] == 'undefined') data['badtris'] = [];
	return data;
}

function meshDraw(data) {
	
	let svgElements = [];
	if(!data) return svgElements;

	// Convert to pixel co-ordinates.
	let nodeXYZ = data['nodes'];
	
	let nodeXYZPixel = {...nodeXYZ};
	
	nodeXYZ.forEach((val, index) => nodeXYZPixel[index] = userToPixel(val[0], val[1]) );
	
	svgElements = svgElements.concat(vertexDraw(nodeXYZPixel));
	svgElements = svgElements.concat(elementDraw(nodeXYZPixel, data['triElements'], data['quadElements'], data['badtris'], data['badquads']));
	
	pointsToTheFront();
	
	return svgElements; 
}

function meshReport(data) {

	textBoxMessage((data['nodes'].length).toString() + " new nodes created", "green");
	if(data['triElements'].length>0){
		textBoxMessage((data['triElements'].length).toString() + " new triangular elements created", "green"); }
	
	if(data['quadElements'].length>0){	
		textBoxMessage((data['quadElements'].length).toString() + " new quadrangular elements created", "green"); }
}


function elementDraw(nodes, triElements, quadElements, badtris, badquads){
	
	let svgElements = [];

	if(quadElements.length>0){
	
		let numNodesPerElement = 4
		
		for(let i =0; i<quadElements.length; ++i){
		
			let coordList = Array(numNodesPerElement);
			
			for(let j =0; j<numNodesPerElement; ++j){
				coordList[j] = nodes[quadElements[i][j]];
			}
			
			let ptstring = stringFromPoints(coordList);
			
			let col = 'lightgreen';
			
			svgElements.push(			
			svg.append('polygon')
			.attr('points', ptstring)
			.attr('stroke', 'blue')
			.attr('stroke-width', 1)
			.attr('stroke', 'blue')
			.attr('fill', col));	
			
			if(badquads.includes(i)) {
				col = 'transparent';
				let btri = svg.append('polygon')
				.attr('points', ptstring)
				.attr('stroke', 'blue')
				.attr('stroke-width', 1)
				.attr('stroke', 'blue')
				.attr('fill', col);	
				

				btri.transition().duration(750)
				.on("start", function repeat() {
					d3.active(this)
						.style("fill", "red").transition().duration(750)
						.style("fill","transparent").transition().duration(500)
						.transition().on("start", repeat);
				});
				
				svgElements.push(btri);
	
				}			

  
		}		
	}
	
	
	if(triElements.length > 0){
	
		let numNodesPerElement = 3
		
		for(let i =0; i<triElements.length; ++i){
			
			let coordList = Array(numNodesPerElement);
			
			for(let j =0; j<numNodesPerElement; ++j){
				coordList[j] = nodes[triElements[i][j]];
			}
			
			let ptstring = stringFromPoints(coordList);
			
			let col = 'lightblue';
			
			svgElements.push(			
			svg.append('polygon')
			.attr('points', ptstring)
			.attr('stroke', 'blue')
			.attr('stroke-width', 1)
			.attr('stroke', 'blue')
			.attr('fill', col));	

			if(badtris.includes(i)) {
				col = 'transparent';
				let btri = svg.append('polygon')
				.attr('points', ptstring)
				.attr('stroke', 'blue')
				.attr('stroke-width', 1)
				.attr('stroke', 'blue')
				.attr('fill', col);	

				btri.transition().duration(750)
				.on("start", function repeat() {
					d3.active(this)
						.style("fill", "red").transition().duration(750)
						.style("fill","transparent").transition().duration(500)
						.transition().on("start", repeat);
				});
				
				svgElements.push(btri);
	
				}			
		}		
	}
	
	return svgElements;
}

function vertexDraw(data){
	let svgElements = [];
	
	for(let i =0; i<data.length; ++i){
		svgElements.push(
			svg.append('circle')
			.attr('cx', data[i][0])
			.attr('cy', data[i][1])
			.attr('r', 1)
			.attr('stroke', 'blue')
			.attr('fill', 'blue') );			
	}	
	
	return svgElements;
}