from flask import jsonify

from python.utilities import meshSurface, meshSurface_

from python.db import DB
from python.DB_Points import DB_Points, Point
from python.DB_Lines import DB_Lines, Line
from python.DB_Loops import DB_Loops, Loop
from python.DB_Surfaces import DB_Surfaces, Surface

from shapely.geometry import Point as shPoint
from shapely.geometry.polygon import Polygon


def changeElsize(indata, DBsession):
    ierr = 0
    changedSurfaces = set()
    for q in DBsession.currentSelection['points']: 
        q.putElsize(indata["elsize"])
        
        for lin in DBsession.getLinesDependentOnPoint(q): 
            lin.putElsize(indata["elsize"])
                     
        for srf in DBsession.getSurfacesDependentOnPoint(q):
            changedSurfaces.add(srf)
            
    affectedSurfaces = []             
    for srf in changedSurfaces:
        srf.putElsize(indata["elsize"])
        quadOption = srf.getElementType()
        mesh = None
        if srf.hasMesh():  
            mesh = meshSurface_(srf, quadOption, DBsession)  # remesh       
            affectedSurfaces.append([srf.getHTMLHandle(), mesh]) 
            
    return(jsonify({"error":ierr, "surfaces":affectedSurfaces})) 

def nearestPoint(indata, DBsession):
    ierr = 0
    pt = DBsession.findNearestPoint(indata['coords'], indata['tol'])

    if pt is not None:
        DBsession.selectedPoint = pt
        
        return(jsonify({"error":ierr, \
            "HTMLHandle":pt.getHTMLHandle(), \
            "name":pt.getName(), \
            "elsize":pt.getElsize(), \
            "coords":pt.getUserCoordinates()})) 
    else:
        return(jsonify({"error":ierr}))
        
def addPoint(indata, DBsession):
    ierr = 0
    pt = DBsession.findNearestPoint(indata['coords'], indata['tol'])
    
    if pt is not None:
        return (jsonify({"error":ierr, "index":None})) 
        
    ind = DBsession.getNumPoints()
    name = indata['name'] if 'name' in indata else "P"+str(ind+1)  
    
    pt = Point(indata['coords'], indata['elsize'], indata['HTMLHandle'], name)
    DBsession.addPoint(pt)
    
    return(jsonify({"error":ierr, "index":ind, "name":pt.getName()}))   
        


def pointsInPolygon(indata, DBsession):
    ierr = 0
    polygon = Polygon(indata['polygonCoords'])
    
    DBsession.currentSelection['points'] = [ qq for qq in DBsession.Points if polygon.contains(shPoint(qq.getUserCoordinates()))]  
    pointCoords = [qq.getUserCoordinates() for qq in DBsession.currentSelection['points']]
    
    DBsession.currentSelection['lines'] = []
    DBsession.currentSelection['surfaces'] = []
    DBsession.currentSelection['beziers'] = []
    DBsession.currentSelection['bsplines'] = []
    
    return(jsonify({"error":ierr, "pointCoords":pointCoords})) 


def updatePoint(indata, DBsession):

    ierr = 0
    
    pnt = DBsession.selectedPoint
    pnt.putUserCoordinates(indata['coords'])
    pnt.putElsize(indata['elsize'])
    
    affectedPoints = [[pnt.getHTMLHandle(), pnt.getName(), indata['coords']]]
    
    affectedLines = []
    for ll in DBsession.getLinesDependentOnPoint(pnt):
        pt0, pt1 = ll.getPoints() 
        affectedLines.append([ll.getHTMLHandle(), pt0.getUserCoordinates(), pt1.getUserCoordinates()])
        
    affectedBeziers = []
    
    for bz in DBsession.getBezierCurvesDependentOnPoint(pnt):
        bz.update()
        affectedBeziers.append([bz.getHTMLHandle(), bz.getControlPolygonCoords(), bz.getRendering()])
  
    affectedBSplines = []
    
    for bs in DBsession.getBSplineCurvesDependentOnPoint(pnt):
        bs.update()
        affectedBSplines.append([bs.getHTMLHandle(), bs.getControlPolygonCoords(), bs.getRendering()])
        
    affectedSurfaces = []
    for srf in DBsession.getSurfacesDependentOnPoint(pnt):
        quadOption = srf.getElementType()
        mesh = None
        if srf.hasMesh():  
            mesh = meshSurface_(srf, quadOption, DBsession )  # remesh
         
        affectedSurfaces.append([srf.getHTMLHandle(), mesh])
    
    return(jsonify({"error":ierr, \
            "points": affectedPoints, \
            "lines":affectedLines, \
            "beziers":affectedBeziers, \
            "bsplines":affectedBSplines, \
            "surfaces":affectedSurfaces}))   