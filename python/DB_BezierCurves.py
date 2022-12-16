from python.bezier import bezier, bezierInterpolate

class DB_BezierCurves():
    def __init__(self):
        self.BezierCurves = []
             
    def clear(self):
        self.BezierCurves = []
        
    def addBezierCurve(self, bz):
        nbz = len(self.BezierCurves)
        self.BezierCurves.append(bz)
        return nbz
        
    def getNumBezierCurves(self):
        return len(self.BezierCurves)
        
from python.Entity import Edge
    
class BezierCurve(Edge):

    def __init__(self, points, coords, method, degree, HTMLNodes, elsize, name):
        self.points = points
        self.controlPolygonCoords = coords
        self.controlPointMethod = method    # True  => direct control point specification
                                            # False => interpolation
        self.rendering = []
        self.degree = degree
        
        bc1 = bezier(coords)
        for i in range(101):
            param = 0.01*i
            renderPoint = bc1.evaluate(param).tolist()
            self.rendering.append(renderPoint)       
           
        super().__init__(elsize, HTMLNodes, name)
    
    def getControlPolygonCoords(self):
        return self.controlPolygonCoords
    
    def putControlPolygonCoords(self, coords):
        self.rendering = []
        bc1 = bezier(coords)
        for i in range(101):
            param = 0.01*i
            renderPoint = bc1.evaluate(param).tolist()
            self.rendering.append(renderPoint)       
            
        self.controlPolygonCoords = coords
        
    def update(self):
    
        coords = [p.getUserCoordinates() for p in self.points]
        if self.controlPointMethod:
            # Control points specified directly.
            
            self.render(coords)
            self.controlPolygonCoords = coords
        else:
            rendering, polygonCoords = bezierInterpolate(coords, self.degree)
            self.controlPolygonCoords = polygonCoords
            self.rendering = rendering
            
    def render(self, coords):
        self.rendering = []
        bc1 = bezier(coords)
        for i in range(101):
            param = 0.01*i
            renderPoint = bc1.evaluate(param).tolist()
            self.rendering.append(renderPoint)    

    def getControlPointMethod(self):
        return self.controlPointMethod
        
    def getPoints(self):
        return self.points
        
    def getDegree(self):
        return self.degree
        
    def getRendering(self):
        return self.rendering
        
    def putRendering(self, rendering):
        self.rendering = rendering
    
      
