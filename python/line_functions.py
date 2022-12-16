from flask import jsonify

from python.db import DB
from python.DB_Points import DB_Points, Point
from python.DB_Lines import DB_Lines, Line

def addLine(indata, DBsession):
    ierr = 0
    ind = DBsession.getNumLines()
    name = indata['name'] if 'name' in indata else "L"+str(ind+1)  
 
    ln = Line(indata['points'], indata['HTMLHandle'], indata['elsize'], name)
    DBsession.addLine(ln)
           
    c1 = DBsession.Points[indata['points'][0]].getUserCoordinates()
    c2 = DBsession.Points[indata['points'][1]].getUserCoordinates()
    
    return(jsonify({"error":ierr, "index":ind, "name":ln.getName(), "coords":[c1,c2]}))    
    
def nearestLine(indata, DBsession):
    ierr = 0
    ln = DBsession.findNearestLine(indata['coords'], indata['tol'])

    if ln is not None:
        DBsession.selectedLine = ln
        return(jsonify({"error":ierr, "HTMLHandle":ln.getHTMLHandle(), "name":ln.getName(), "elsize":ln.getElsize()})) 