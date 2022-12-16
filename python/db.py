from python.DB_Utilities import DB_Utilities

class DB(DB_Utilities):  

    def __init__(self, name):    
        super().__init__()
        
        self.name = name
        self.currentSelection = {}
        self.selectedPoint = None
        self.selectedLine  = None
        self.selectedSurface  = None
        
        self.firstUnusedPoint = 0
        
        self.meshList = []
        
    def clear(self):
        super().clear()
        self.currentSelection = {}
        self.selectedPoint = None
        self.selectedLine  = None
        self.selectedSurface  = None
        
        self.firstUnusedPoint = 0
        
        self.meshList = []
        
    def clearSelection(self):
        self.currentSelection = {}


        
        
        
