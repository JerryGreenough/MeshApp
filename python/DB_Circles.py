class DB_Circles():
    def __init__(self):
        self.Circles = []
               
    def clear(self):
        self.Circles = []
        
    def addCircle(self, cc):
        ncirc = len(self.Circles)
        self.Circles.append(cc)
        return ncirc
        
    def getNumCircles(self):
        return len(self.Circles)
        
from python.Entity import Edge
import numpy as np
    
class Circle(Edge):

    def __init__(self, point, radius, HTMLHandle, elsize, name):
        self.point = point
        self.radius = radius
        self.rendering = []
        super().__init__(elsize, HTMLHandle, name)
    
    def getPoint(self):
        return self.point
    
    def putPoint(self, point):
        self.point = point
        
    def getRadius(self):
        return self.radius
    
    def putRadius(self, radius):
        self.radius = radius
        
    def getRendering(self):
        if len(self.rendering) == 0: self.render()
        return self.rendering
        
    def render(self):
        self.rendering = []
        center = (self.point).getUserCoordinates()
     
        angs = np.pi * 2.0 * np.arange(0.0, 1.0, 0.01)
      
        xx = self.radius * np.cos(angs) 
        yy = self.radius * np.sin(angs) 
       
        xyz = zip(list(xx + center[0]), list(yy + center[1]))
        self.rendering = list(xyz)
      
    def generateBead(self):
        ninc = int(self.radius * 2.0 * np.pi / self.getElsize())
        ninc = max(ninc, 4)
        
        angs = np.pi * 2.0 * np.arange(0.0, 1.0, 1.0/ninc)
      
        xx = self.radius * np.cos(angs) 
        yy = self.radius * np.sin(angs) 
       
        center = (self.point).getUserCoordinates()
       
        xyz = zip(list(xx + center[0]), list(yy + center[1]))
        return(list(xyz))
        
        
        

        
        
 
        
