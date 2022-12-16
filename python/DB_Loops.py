class DB_Loops():
    def __init__(self):
        self.Loops = []
        
    def clear(self):
        self.Loops = []
        
    def addLoop(self, su):
        nloops = len(self.Loops)
        self.Loops.append(su)
        return nloops
        
    def getNumLoops(self):
        return len(self.Loops) 
        
from python.Entity import Entity
from collections import OrderedDict
    
class Loop(Entity):

    def __init__(self, edges, name):
        self.edges = edges
        super().__init__(None, None, name)
    
    def getEdges(self):
        return self.edges
    
    def putEdges(self, edges):
        self.edges = edges
        
    def getPoints(self):
        od = OrderedDict()
        for ee in self.edges:
            p1, p2 = ee.getPoints()
            od[p1] = None
            od[p2] = None
            
        return list(od.keys())
    
    def getCoordinates(self):
        res = [pt.getUserCoordinates() for pt in self.getPoints()]
        return res