from python.bspline import bSplineInterpolate
from scipy.interpolate import BSpline as BSPL

class DB_BSplineCurves():
    def __init__(self):
        self.BSplineCurves = []
             
    def clear(self):
        self.BSplineCurves = []
        
    def addBSplineCurve(self, bs):
        nbs = len(self.BSplineCurves)
        self.BSplineCurves.append(bs)
        return nbs
        
    def getNumBSplineCurves(self):
        return len(self.BSplineCurves)
        
from python.Entity import Edge
    
class BSplineCurve(Edge):

    def __init__(self, points, coords, knots, method, degree, HTMLNodes, elsize, name):
        self.points = points
        self.controlPolygonCoords = coords
        self.controlPointMethod = method    # True  => direct control point specification
                                            # False => interpolation
        self.rendering = []
        self.degree = degree
        self.knots = knots
        
        self.render(coords)
            
        super().__init__(elsize, HTMLNodes, name)
    
    def getControlPolygonCoords(self):
        return self.controlPolygonCoords
    
    def putControlPolygonCoords(self, coords):
        self.render(coords)
        self.controlPolygonCoords = coords
        
    def update(self):
    
        coords = [p.getUserCoordinates() for p in self.points]
        if self.controlPointMethod:
            # Control points specified directly.
            
            self.render(coords)
            self.controlPolygonCoords = coords
        else:
            rendering, polygonCoords, knots, degree = bSplineInterpolate(coords, self.degree)
            self.controlPolygonCoords = polygonCoords
            self.rendering = rendering
            self.knots = knots
            self.degree = degree
            
    def render(self, coords):
        self.rendering = []
    
        spl = BSPL(self.knots, coords, self.degree)
        
        for i in range(101):
            param = self.knots[0] + 0.01*i *(self.knots[-1] - self.knots[0])
            renderPoint = spl(param).tolist()
            self.rendering.append(renderPoint)  

    def getControlPointMethod(self):
        return self.controlPointMethod
        
    def getPoints(self):
        return self.points
        
    def getRendering(self):
        return self.rendering
 
    def getKnots(self):
        return self.knots
 
    def putKnots(self, knots):
        self.knots = knots
        
    def getDegree(self):
        return self.degree
 
    def putDegree(self, degree):
        self.degree = degree
        
        
