# import main Flask class and request object
from flask import Flask, request, render_template, jsonify, url_for
import json

from python.utilities import distToSet, splitLine, meshSurface, meshSurface_, addNewLoop
from python.utilities import adjustLineElsize, adjustPointElsize, addNewBezierCurve, addNewBSplineCurve
from python.utilities import copyEntities, addCircle, getStats

from python.db import DB

from python.point_functions import updatePoint, pointsInPolygon, nearestPoint, addPoint, changeElsize
from python.line_functions import addLine, nearestLine
from python.mesh_functions import meshReport

# create the Flask app
app = Flask(__name__)


DBDict = {}       # A dictionary of databases, with session names as keys.
sessionName = ""  # Current session name.

@app.route('/')
def main():
    return render_template('topLevel.html', version='Only to be used for demonstration purposes')

@app.route('/dbOps', methods=['GET', 'POST'])
def dbOps():
    # Ths route managers the transfer of information between the front and back ends. It is also
    # responsible for gemeoetry and mesh creation.
    # When a geometric calculation is performed, data related to drawing updates are sent to the 
    # appropriate HTML handle of an element on the front end.
    
    if request.method == 'POST':
        # The client (front end) is making a POST request to the server (backend).
     
        data = (request.data).decode()
        
        indata = json.loads(data)		
        op = indata['op']
        sessionName = indata['sessionName']
       
        ierr = 0
               
        if op=="open":
            if sessionName in DBDict:
                print("Reopening session: ", sessionName)
            else:
                print("New session: ", sessionName)
                DBDict[sessionName] = DB(sessionName)
                
        elif op=="clear":
            if 'selection' in indata:
                DBDict[sessionName].clearSelection()
            else:
                DBDict[sessionName].clear()
         
        elif op=="addPoint":   
            return(addPoint(indata, DBDict[sessionName]))
            
        elif op=="addLine": 
            return(addLine(indata, DBDict[sessionName]))        

        elif op=="addLoop":   
            return(addNewLoop(indata, DBDict[sessionName]))
            
        elif op=="addBezier":
            return(addNewBezierCurve(indata, DBDict[sessionName]))
            
        elif op=="addBSpline":
            return(addNewBSplineCurve(indata, DBDict[sessionName]))
                         
        elif op=="updatePoint":   
            return(updatePoint(indata, DBDict[sessionName]))

        elif op=="getPointCoordinates":
            ptcoords = [x.getUserCoordinates() for x in DBDict[sessionName].Points]
            return(jsonify({"error":ierr, "coords":ptcoords})) 
            
        elif op=="pointsInPolygon":
            return(pointsInPolygon(indata, DBDict[sessionName]))
            
        elif op=="nearestLine":
            return(nearestLine(indata, DBDict[sessionName]))
                
        elif op=="nearestPoint":
            return(nearestPoint(indata, DBDict[sessionName]))
                    
        elif op=="addCircle":          
            return(addCircle(indata, DBDict[sessionName]))
                
        elif op=="splitLine":          
            return(splitLine(indata, DBDict[sessionName]))
            
        elif op=="adjustLineElsize":          
            return(adjustLineElsize(indata, DBDict[sessionName]))
            
        elif op=="adjustPointElsize":          
            return(adjustPointElsize(indata, DBDict[sessionName]))
            
        elif op=="meshSurface":       
            return(meshSurface(DBDict[sessionName].selectedSurface, indata['quad'], DBDict[sessionName]))
            
        elif op=="changeElsize":
            return(changeElsize(indata, DBDict[sessionName]))
            
        elif op=="getStats":
            return(getStats(DBDict[sessionName]))
          
        elif op=="meshReport":
            meshReport(DBDict[sessionName])
            
        elif op=="copy":
            return(copyEntities(indata, DBDict[sessionName]))
            
        return(jsonify({"error":ierr}))   


    
    
@app.route('/Output/<sessionName>', methods=['GET', 'POST'])

# This route is used for the textual output of mesh information.

def output_setup(sessionName):
    if request.method == 'POST':
        pass
    elif request.method == 'GET': 
        # The client is requesting meshing information from the backend server.
        
        if len(DBDict[sessionName].meshList)>0:
            return render_template('mesh.html', meshes = DBDict[sessionName].meshList)
        else:
            return ("No mesh to output.")             
    else:
        pass
        

if __name__ == '__main__':
    app.run()