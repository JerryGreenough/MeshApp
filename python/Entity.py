class Entity():
    
    def __init__(self, elsize, HTML_Nodes, name):
        self.name = name
        self.HTML_Nodes = HTML_Nodes
        self.elsize = elsize
        
    def getName(self):
        return self.name
        
    def putName(self, name):
        self.name = name     
        
    def getElsize(self):
        return self.elsize
        
    def getHTMLHandle(self):
        return self.HTML_Nodes
    
    def putElsize(self, els):
        self.elsize = els
    
    def putHTMLHandle(self, ihtml):
        self.HTML_Nodes = ihtml	
        
        
class Edge(Entity):

    def __init__(self, elsize, HTMLNodes, name):
        super().__init__(elsize, HTMLNodes, name)
    