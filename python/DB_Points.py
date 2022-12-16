from scipy.spatial import KDTree
import numpy as np

class DB_Points():
    
    def __init__(self):
        self.Points = []
        
    def clear(self):
        self.Points = []
        
    def addPoint(self, pt):
        npts = len(self.Points)
        self.Points.append(pt) 
        return npts

    def getNumPoints(self):
        return len(self.Points)
        
    def findNearestPoint(self, coords, tol):      
        if len(self.Points) == 0: return None
        
        A = np.array([pp.getUserCoordinates() for pp in self.Points])
        idx = KDTree(A).query(coords)
        
        dist = np.linalg.norm(A[int(idx[1])] - np.array(coords))
        if dist<tol: return self.Points[int(idx[1])]
        return None
       

from python.Entity import Entity      
       
class Point(Entity):

    def __init__(self, userCoords, elsize, HTMLNodes, name):
        self.userCoords = userCoords
        super().__init__(elsize, HTMLNodes, name)
    
    def getUserCoordinates(self):
        return self.userCoords
    
    def putUserCoordinates(self, userCoords):
        self.userCoords = userCoords




    