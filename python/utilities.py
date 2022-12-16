from python.DB_Points import Point
from python.DB_Lines import Line
from python.DB_Loops import Loop
from python.DB_Surfaces import Surface
from python.DB_Circles import Circle
from python.DB_BezierCurves import BezierCurve
from python.DB_BSplineCurves import BSplineCurve

from flask import jsonify

from gmsh import clear, initialize
from gmsh import model, option

from scipy.spatial import ConvexHull, KDTree

from python.meshQuality import meshQuality
from python.bezier import bezierInterpolate
from python.bspline import bSplineInterpolate

from shapely.geometry import Point as shPoint, LineString, Polygon
from shapely import wkt
from shapely.ops import polygonize, unary_union, split

from sys import float_info
BIGNUM = float_info.max

import numpy as np

def distToSet(segmentList, testPoint):

    mindist = BIGNUM
    iset = -1
    
    for idx, qq in enumerate(segmentList):
        dist = distToSegment(qq, testPoint)
        
        if dist<mindist:
            mindist = dist
            iset = idx
            
    return mindist
     
     
     
def distToSegment(segment, testPoint):

    segvec = [segment[1][0]-segment[0][0], segment[1][1]-segment[0][1]]
    testvec = [testPoint[0]-segment[0][0], testPoint[1]-segment[0][1]]
    
    length = np.sqrt(np.dot(segvec, segvec))
    
    eta = np.cross(segvec, testvec) / length
    ksi = np.dot(testvec, segvec) / length
    
    if ksi>length:
        ksi -= length
    elif ksi>0.0:
        ksi = 0.0
        
    dist = np.sqrt(ksi**2 + eta**2)
        
    return dist
    
    
def adjustLineElsize(indata, DBsession):

    ierr = 0
    
    ln = DBsession.selectedLine
    pts = ln.getPoints()
    pts[0].putElsize(indata['elsize'])
    pts[1].putElsize(indata['elsize'])
    
    affectedSurfaces = []
    
    for srf in DBsession.getSurfacesDependentOnLine(ln):
        quadOption = srf.getElementType()
        mesh = None
        if srf.hasMesh():  
            mesh = meshSurface_(srf, quadOption, DBsession)  # remesh
        
        affectedSurfaces.append([srf.getHTMLHandle(), mesh])
    
    return(jsonify({"error":ierr, "surfaces":affectedSurfaces}))   
    
def adjustPointElsize(indata, DBsession):

    ierr = 0
    
    pt = DBsession.selectedPoint
    pt.putElsize(indata['elsize'])
    
    affectedSurfaces = []
    
    for srf in DBsession.getSurfacesDependentOnPoint(pt):
        quadOption = srf.getElementType()
        mesh = None
        if srf.hasMesh():  
            mesh = meshSurface_(srf, quadOption, DBsession)  # remesh
        
        affectedSurfaces.append([srf.getHTMLHandle(), mesh])
        
    return(jsonify({"error":ierr, "surfaces":affectedSurfaces}))   
    
def splitLine(indata, DBsession):

    ierr = 0
    
    lnold = DBsession.selectedLine
    pts = lnold.getPoints()
    p0  = np.array(pts[0].getUserCoordinates())
    p1  = np.array(pts[1].getUserCoordinates())
    
    vec = p1-p0
    length = np.linalg.norm(vec)
    
    if indata['ratio']:
        ratio = indata['ratio']           
    else:
        ratio = indata['length'] / length
        
    if abs(ratio) >=1.0: return(jsonify({"error":1}))  
    
    pcoords = p0 + ratio * vec
    pcoords = pcoords.tolist()
    
    ind = DBsession.getNumPoints()
    newPointName = "P"+str(ind+1) 
    
    ind = DBsession.getNumLines()
    newLineName = "L"+str(ind+1)  
    
    elsize = lnold.getElsize()
    
    pt = Point(pcoords, elsize, indata['HTMLHandle_point'], newPointName)
    ipnew = DBsession.addPoint(pt)
    
    lnold.putPoints([pts[0], pt])
    
    ln = Line([pt, pts[1]], indata['HTMLHandle_line'], elsize, newLineName)
    DBsession.addLine(ln)
    
    p0 = p0.tolist()
    p1 = p1.tolist()
    
    lcoords_old = [p0, pcoords]
    lcoords_new = [pcoords, p1] 
    
    DBsession.selectedLine = None
    
    affectedPoints = [[pt.getHTMLHandle(), pt.getName(), pcoords]]
    
    affectedLines = [[ln.getHTMLHandle(), p0, pcoords]]
    affectedLines.append([indata['HTMLHandle_line'], pcoords, p1])
                    
    affectedSurfaces = []
    
    for srf in DBsession.getSurfacesDependentOnLine(lnold):
        quadOption = srf.getElementType()
        mesh = None
        if srf.hasMesh():  
            mesh = meshSurface_(srf, quadOption, DBsession)  # remesh
        
        affectedSurfaces.append([srf.getHTMLHandle(), mesh])
 
    return(jsonify({"error":ierr, "points": affectedPoints, "lines":affectedLines, "surfaces":affectedSurfaces}))   
   
def meshSurface_(srf, quadOption, DBsession):

    ierr = 0
    
    numNodesPerElement = 3
    if quadOption: numNodesPerElement = 4
    
    meshDict = {'nodes': [], 'elements':[]}
    
    pointCoordLists = []
    pointElsizeLists = []
    
    for sloop in srf.getLoops():
        if type(sloop).__name__ == "Circle":
            ptCoordList = sloop.generateBead()
            ptElsizeList = [sloop.getElsize() for _ in ptCoordList]
            
        else:
            ptList = sloop.getPoints()          
            # Construct point co-ordinate list for this loop.   
            ptCoordList = [pt.getUserCoordinates() for pt in ptList]
                
            # Construct element size list for this loop.
            ptElsizeList = [pt.getElsize() for pt in ptList]
        
        pointCoordLists.append(ptCoordList)
        pointElsizeLists.append(ptElsizeList)
            
    initialize()  
                               
    pts = []
    lns = []
                
    npts0 = 0
    nlns0 = 0
                
    loops = []
                
    for p, q in zip(pointCoordLists, pointElsizeLists):
                        
        for px,qx in zip(p, q):
            pts.append(model.geo.add_point(px[0], px[1], 0, qx))
            
        npts1 = len(pts)  
            
        for px, qx in zip(pts[npts0:npts1-1], pts[npts0+1:npts1]):
            lns.append(model.geo.add_line(px,qx))
     
        lns.append(model.geo.add_line(pts[npts1-1],pts[npts0]))
        
        nlns1 = len(lns)
        
        loop = model.geo.add_curve_loop(lns[nlns0:nlns1])   
        
        loops.append(loop)
        
        nlns0 = nlns1
        npts0 = npts1    
                           
    ss = model.geo.add_plane_surface(loops)
             
    model.geo.synchronize()
 
    if numNodesPerElement == 3:  
        option.setNumber("Mesh.Algorithm", 5)
    else:
        option.setNumber("Mesh.Algorithm", 8)
        option.setNumber("Mesh.RecombinationAlgorithm", 2)
  
    # Generate mesh:
    model.mesh.generate(2)
    if numNodesPerElement == 4:  model.mesh.recombine()
               
    xxx = model.mesh.getNodes()
    numNodes = int(len(xxx[1])/3)
    
    xyzList = []
    iptr = 0
    
    for i in range(numNodes):
        xyzList.append(tuple((xxx[1][iptr:iptr+2])))
        iptr+=3
    
    yyy = model.mesh.getElements()
                   
    numTriElements = 0
    numQuadElements = 0
    
    if len(yyy[2])==4:
        numTriElements = int(len(yyy[2][1])/3)
        numQuadElements = int(len(yyy[2][2])/4)
        rawListTri = list(yyy[2][1])
        rawListQuad = list(yyy[2][2])
    else:
        if numNodesPerElement>3:
            numQuadElements = int(len(yyy[2][1])/4)
            rawListQuad = list(yyy[2][1])
        else:
            numTriElements = int(len(yyy[2][1])/3)
            rawListTri = list(yyy[2][1])
                           
    quadList = []
    triList = []
                            
    iptr = 0
    for i in range(numQuadElements):
        quadList.append(tuple([int(q)-1 for q in rawListQuad[iptr:iptr+4]]))
        iptr+=4
        
    iptr = 0
    for i in range(numTriElements):
        triList.append(tuple([int(q)-1 for q in rawListTri[iptr:iptr+3]]))
        iptr+=3
                    
    meshDict['nodes'] = xyzList
    meshDict['quadElements'] = quadList
    meshDict['triElements'] = triList
    
    badquads = meshQuality(xyzList, quadList, 4)
    badtris = meshQuality(xyzList, triList, 3)
    
    meshDict['badquads'] = badquads
    meshDict['badtris'] = badtris
    meshDict['error'] = 0
                  
    model.geo.synchronize()
    
    clear() 
    
    meshDict['error'] = ierr
    meshDict['HTMLHandle'] = srf.getHTMLHandle()
    
    
    srf.putMesh(meshDict)
        
    return(meshDict)
    
def getStats(DBsession):
    numNodes, numElements = DBsession.getMeshStats()
    return(jsonify({ \
        "numPoints":DBsession.getNumPoints(),\
        "numLines": DBsession.getNumLines(),\
        "numLoops": DBsession.getNumLoops(),\
        "numSurfaces": DBsession.getNumSurfaces(),\
        "numNodes": numNodes, \
        "numElements": numElements, \
        "numBeziers": 0,\
        "numBSplines": 0\
    }))
    
    
def meshSurface(srf, quadOption, DBsession):
    srf.putElementType(quadOption)

    meshDict = meshSurface_(srf, quadOption, DBsession) 
    return(jsonify(meshDict))
    
def addNewLoop(indata, DBsession):
    ierr = 0
    ind = DBsession.getNumLoops()
    name = indata['name'] if 'name' in indata else "LP"+str(ind+1)  
              
    # Determine the point list.
    
    if indata['selection']:
        loopPoints = DBsession.currentSelection['points']
    else:
        loopPoints = [DBsession.Points[ip] for ip in range(DBsession.firstUnusedPoint, DBsession.getNumPoints())]      
        
    DBsession.firstUnusedPoint = DBsession.getNumPoints()
        
    coords = [pt.getUserCoordinates() for pt in loopPoints]
    
    if len(loopPoints)<3: 
        ierr = 1
        return(jsonify({"error":ierr}))
    else:
        bConvex = False
        if indata['convexPolygon']: bConvex = True
 
        if not bConvex:
            # Detect any self interections.     
            pcoords = [lp.getUserCoordinates() for lp in loopPoints]
            if not Polygon(LineString(pcoords)).is_simple: bConvex = True
    
              
        if bConvex:
            hull = ConvexHull(coords)
            indices = [int(q) for q in hull.vertices]                   
            coords = [coords[iq] for iq in indices]
            loopPoints = [loopPoints[iq] for iq in indices]
          
            
        ihtml = indata['HTMLHandle']
        npts = len(loopPoints)
        ind = DBsession.getNumLines()
        endCoords = [] 
        edges = []
        
        for ii in range(npts):
            name = "L"+str(ind+ii)
            
            pts = [loopPoints[ii], loopPoints[(ii+1)%npts]]
 
            ln = Line(pts, ihtml+ii, indata['elsize'], name)
            il = DBsession.addLine(ln)
        
            edges.append(ln)
           
            c1 = coords[ii]
            c2 = coords[(ii+1)%npts]              
            endCoords.append([c1, c2])                  
            
        lp = Loop(edges, name) 
        DBsession.addLoop(lp)    

        # Are there any loops completely contained within this loop ?
        # If so automatically create some holes.
        
        holeLoops = DBsession.getLoopsInsideLoop(lp)
        loopList = [lp]
        loopList.extend(holeLoops)
        
        circleList = DBsession.getCirclesInsideLoop(lp)
        loopList.extend(circleList)
        
        name = "S"+str(DBsession.getNumSurfaces()+1)
        srf = Surface(loopList, indata['surfaceHTMLHandle'], indata['elsize'], name)
        DBsession.addSurface(srf)
        DBsession.selectedSurface = srf

        return(jsonify({"error":ierr, "lines": endCoords, "name":name}))    


def addCircle(indata, DBsession):
    ierr = 0
    
    pt = DBsession.selectedPoint    
        
    ind = DBsession.getNumCircles()
    name = indata['name'] if 'name' in indata else "C"+str(ind+1)  
    
    cc = Circle(pt, indata['radius'], indata['HTMLHandle'], indata['elsize'], name)
    DBsession.addCircle(cc)  
    
    DBsession.firstUnusedPoint = DBsession.getNumPoints()    
    
    return(jsonify({"error":ierr, "name":cc.getName(), "radius":cc.getRadius(), "center":pt.getUserCoordinates()}))           


def addNewBezierCurve(indata, DBsession):	
    
    bSelect = False
    if 'points' in DBsession.currentSelection:
        if len(DBsession.currentSelection['points']) > 0: bSelect = True
        
    if bSelect:
        bzPoints = DBsession.currentSelection['points']
    else:
        bzPoints = [DBsession.Points[ip] for ip in range(DBsession.firstUnusedPoint, DBsession.getNumPoints())]  
    
    
    if len(bzPoints) <=  2:
        return jsonify({"error":1})      

    degree = 0
    if 'degree' in indata: degree = indata['degree']
    degree = min(degree, len(bzPoints)-1)
    if degree==0: degree = len(bzPoints) - 1      
    
    points = bzPoints
    bzPoints = [q.getUserCoordinates() for q in bzPoints]
    
    if indata['method']:
        # Direct control point method.
        
        polygonCoords = bzPoints
    
    else:
        # Interpolation.
    
        rendering, polygonCoords = bezierInterpolate(bzPoints, degree)
        
    ind = DBsession.getNumBezierCurves()
    name = indata['name'] if 'name' in indata else "Bz"+str(ind+1)  
    
    bz = BezierCurve(points, polygonCoords, indata['method'], degree, indata['HTMLHandle'], indata['elsize'], name)
    DBsession.addBezierCurve(bz)  
    
    DBsession.firstUnusedPoint = DBsession.getNumPoints()    
    
    return(jsonify({"error":0, "name":bz.getName(), "rendering":bz.getRendering(), "polygon":polygonCoords}))   
    
    
def addNewBSplineCurve(indata, DBsession):	

    bSelect = False
    if 'points' in DBsession.currentSelection:
        if len(DBsession.currentSelection['points']) > 0: bSelect = True
        
    if bSelect:
        bsPoints = DBsession.currentSelection['points']
    else:
        bsPoints = [DBsession.Points[ip] for ip in range(DBsession.firstUnusedPoint, DBsession.getNumPoints())]  
      
    if len(bsPoints) <=  2:
        return jsonify({"error":1})      

    degree = 0
    if 'degree' in indata: degree = indata['degree']
 
    points = bsPoints
    bsPoints = [q.getUserCoordinates() for q in bsPoints]
     
    if 'knots' in indata:
        knots = indata['knots']	 
        degree = len(knots) - len(bsPoints) - 1     
    else: 
        # Automatic definition of knot sequence.
        
        if degree==0: degree = len(bsPoints) - 1
        numKnots = len(bsPoints) + 1 + degree
        
        knots = [0.0]*(degree+1)
        
        numInternal = numKnots - 2*(degree+1)
        h = 1.0 / (numInternal + 1)
        
        for i in range(numInternal): knots.append(h * (i+1))
        knots.extend([1.0]*(degree+1))
        
    if degree<1:
        return jsonify({"error":2})  # not enough knots.
				#textBoxMessage("Not enough knots for a " + controlPointCoords.length.toString() + " control points.","red");
       
           
    if indata['method']:
        # Direct control point method.
        
        polygonCoords = bsPoints   
    else:
        # Interpolation.
    
        rendering, polygonCoords, knots, degree = bSplineInterpolate(bsPoints, degree)
               
    ind = DBsession.getNumBSplineCurves()
    name = indata['name'] if 'name' in indata else "Bs"+str(ind+1)  
    
    bs = BSplineCurve(points, polygonCoords, knots, indata['method'], degree, indata['HTMLHandle'], indata['elsize'], name)
    DBsession.addBSplineCurve(bs)  
    
    DBsession.firstUnusedPoint = DBsession.getNumPoints()    
    
    return(jsonify({"error":0, "name":bs.getName(), "rendering":bs.getRendering(), "polygon":polygonCoords, "degree":bs.getDegree()}))   
                  
 
def copyEntities(indata, DBsession):
    affectedPoints = []
    affectedLines = []
    affectedSurfaces = []
    affectedBezierCurves = []
    affectedBSplineCurves = []
    
    ind = DBsession.getNumPoints()
    iphtml = indata['HTMLHandles']['points']
    
    oldToNewPoints = {}
    
    for q in DBsession.currentSelection['points']:
        pcoords = list(  np.array(q.getUserCoordinates()) + np.array(indata['translation'])  )
        pcoords = [float(xx) for xx in pcoords]
        newPointName = "P"+str(ind+1) 
        
        pt = Point(pcoords, q.getElsize(), iphtml, newPointName)
        DBsession.addPoint(pt)
       
        oldToNewPoints[q] = pt 
        affectedPoints.append([iphtml, newPointName, pcoords])
 
        ind += 1
        iphtml += 1

    ind = DBsession.getNumLines()
    ilhtml = indata['HTMLHandles']['lines']
    
   
    depLines = DBsession.getLinesDependentOnAllSelectedPoints(DBsession.currentSelection['points'])
    oldToNewLines = {}
    
    for q in depLines:
        pts = q.getPoints()
        
        newLineName = "L"+str(ind+1) 
        ln = Line([oldToNewPoints[pts[0]], oldToNewPoints[pts[1]]], ilhtml, q.getElsize(), newLineName)
        
        DBsession.addLine(ln)
        
        oldToNewLines[q] = ln
        affectedLines.append([ilhtml, oldToNewPoints[pts[0]].getUserCoordinates(), oldToNewPoints[pts[1]].getUserCoordinates()])
      
        ind += 1
        ilhtml += 1
        
    ind = DBsession.getNumBezierCurves()
    ibhtml = indata['HTMLHandles']['beziers']
    
    depBeziers = DBsession.getBeziersDependentOnAllSelectedPoints(DBsession.currentSelection['points'])
    oldToNewBeziers = {}
    
    for q in depBeziers:
        newBezierName = "Bz"+str(ind+1) 
      
        points = [oldToNewPoints[pt] for pt in q.getPoints()]
        
        pcoords = [pt.getUserCoordinates() for pt in points]
     
        bz = BezierCurve(points, pcoords, q.getControlPointMethod(), q.getDegree(), ibhtml, q.getElsize(), newBezierName)
        
        DBsession.addBezierCurve(bz)
        oldToNewBeziers[q] = bz
        
        affectedBezierCurves.append([bz.getHTMLHandle(), bz.getControlPolygonCoords(), bz.getRendering()])
        
        ind+=1
        ibhtml+=1
    
    
    ind = DBsession.getNumBSplineCurves()
    ibhtml = indata['HTMLHandles']['bsplines']
    
    depBSplines = DBsession.getBSplinesDependentOnAllSelectedPoints(DBsession.currentSelection['points'])
    oldToNewBSplines = {}
    
    for q in depBSplines:
        newBSplineName = "Bz"+str(ind+1) 
      
        points = [oldToNewPoints[pt] for pt in q.getPoints()]
        
        pcoords = [pt.getUserCoordinates() for pt in points]
     
        bs = BSplineCurve(points, pcoords, q.getKnots(), q.getControlPointMethod(), q.getDegree(), ibhtml, q.getElsize(), newBSplineName)
        
        DBsession.addBSplineCurve(bs)
        oldToNewBSplines[q] = bs
        
        affectedBSplineCurves.append([bs.getHTMLHandle(), bs.getControlPolygonCoords(), bs.getRendering()])
        
        ind+=1
        ibhtml+=1
        
    ind = DBsession.getNumLoops()
    
    depLoops = DBsession.getLoopsDependentOnAllSelectedLines(depLines)
    oldToNewLoops = {}
    
    for q in depLoops:
    
        newLoopName = "Lp"+str(ind+1) 
        edges = [oldToNewLines[xx] for xx in q.getEdges()]
        lp = Loop(edges, newLoopName) 
        DBsession.addLoop(lp)    
        oldToNewLoops[q] = lp
      
    ind = DBsession.getNumSurfaces() 
    ishtml = indata['HTMLHandles']['surfaces']
    
    for q in DBsession.getSurfacesDependentOnAllSelectedLoops(depLoops):
        lps = q.getLoops()
        
        newSurfaceName = "S"+str(ind+1) 
        newLoops = [oldToNewLoops[xx] for xx in lps]
        sf = Surface(newLoops, ishtml, q.getElsize(), newSurfaceName)
       
        DBsession.addSurface(sf)
      
        quadOption = q.getElementType()
        mesh = None
        if q.hasMesh():  
            mesh = meshSurface_(sf, quadOption, DBsession)  # remesh       
            
        affectedSurfaces.append([ishtml, mesh])

        ind += 1
        ishtml += 1
        
    DBsession.firstUnusedPoint = DBsession.getNumPoints()  
        
    return(jsonify({"error":0, "points": affectedPoints, "lines":affectedLines, "surfaces":affectedSurfaces, "beziers":affectedBezierCurves, "bsplines":affectedBSplineCurves}))   

	