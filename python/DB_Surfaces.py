class DB_Surfaces():
    def __init__(self):
        self.Surfaces = []
        
    def clear(self):
        self.Surfaces = []
        
    def addSurface(self, su):
        ns = len(self.Surfaces)
        self.Surfaces.append(su)
        return ns
        
    def getNumSurfaces(self):
        return len(self.Surfaces)
        
        
from python.Entity import Entity
    
class Surface(Entity):

    def __init__(self, loops, HTMLHandle, elsize, name):
        self.loops = loops
        self.elementType = None
        self.mesh = None
        super().__init__(elsize, HTMLHandle, name)
    
    def getLoops(self):
        return self.loops
    
    def putLoops(self, loops):
        self.edges = loops
        
    def getElementType(self):
        return self.elementType
        
    def putElementType(self, etype):
        self.elementType = etype
        
    def getMesh(self):
        return self.mesh
        
    def putMesh(self, mesh):
        self.mesh = mesh
        
    def hasMesh(self):
        return (self.mesh is not None)
        
    def getNumNodes(self):
        return len(self.mesh['nodes']) 
        
    def getNumElements(self):
        res = len(self.mesh['triElements'])
        res += len(self.mesh['badtris'])
        res += len(self.mesh['quadElements'])
        res += len(self.mesh['badquads'])
        return res