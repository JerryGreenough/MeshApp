

class DB_Lines():
    def __init__(self):
        self.Lines = []
        
        
    def clear(self):
        self.Lines = []
        
    def addLine(self, ln):
        nlin = len(self.Lines)
        self.Lines.append(ln)
        return nlin
        
    def getNumLines(self):
        return len(self.Lines)
        
from python.Entity import Edge
    
class Line(Edge):

    def __init__(self, points, HTMLNodes, elsize, name):
        self.points = points
        super().__init__(elsize, HTMLNodes, name)
    
    def getPoints(self):
        return self.points
    
    def putPoints(self, points):
        self.points = points
        
        
 
        
