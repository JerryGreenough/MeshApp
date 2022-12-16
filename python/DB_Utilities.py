classNames = ['DB_Points', 'DB_Lines', 'DB_Loops', 'DB_Surfaces', 'DB_BezierCurves', 'DB_BSplineCurves', 'DB_Circles']

from importlib import import_module

classList = [ getattr(import_module('python.' + cc), cc)  for cc in classNames ]


from sys import float_info
BIGNUM = float_info.max

from python.utilities import distToSet

class DB_Utilities(*classList):
    def __init__(self):  
        for x in (self.__class__).__base__.__bases__:
            x.__init__(self)
            
            
    def clear(self):
        for x in (self.__class__).__base__.__bases__:
            x.clear(self)
            
            
            
    def findNearestLine(self, coords, tol):
    
        iset = -1
        mindist = BIGNUM
        
        segmentLists = []
        for ll in self.Lines:
            pts = ll.getPoints()
            c0 = pts[0].getUserCoordinates()
            c1 = pts[1].getUserCoordinates()
            segmentLists.append([[c0, c1]])

        for idx, qq in enumerate(segmentLists):
            dist = distToSet(qq, coords)
            if dist < mindist:
                iset = idx
                mindist = dist
                
        if iset<0: return None
        
        if mindist<tol: return self.Lines[iset]
        
        return None
    
    
    def getSurfacesDependentOnPoint(self, pnt): 
        loopList = set(self.getLoopsDependentOnPoint(pnt))
        res = []
        for ss in self.Surfaces:
            if len(set(ss.getLoops()).intersection(loopList))>0: res.append(ss)
     
        return res
        
    def getSurfacesDependentOnLine(self, ln): 
        res = set()
        for ss in self.Surfaces:
            for lp in ss.getLoops():
                if ln in lp.getEdges():                 
                    res.add(ss)
                    break
        return list(res)
    
    def getLoopsDependentOnPoint(self, pnt):   
        lineList = self.getLinesDependentOnPoint(pnt)
   
        res = []
        for lp in self.Loops:
            for edge in lineList:
                if edge in lp.getEdges():
                    res.append(lp)
                    break
                
        return res
        
    def getLinesDependentOnPoint(self, pnt): 
        res = []
        for ll in self.Lines:
            if pnt in ll.getPoints():
                res.append(ll)
                
        return res
        
    def getLinesDependentOnAllSelectedPoints(self, pnts):
        res = []
        for ll in self.Lines:
            lpts = ll.getPoints()
            if (lpts[0] in pnts) & (lpts[1] in pnts):
                res.append(ll)
                
        return res   

    def getLoopsDependentOnAllSelectedLines(self, lns):   
        res = []
        testEdges = set(lns)
        for ll in self.Loops:
            loopEdges = set(ll.getEdges())
            if len(loopEdges.intersection(testEdges)) == len(loopEdges):
                res.append(ll)
      
        return(res)
    
    def getSurfacesDependentOnAllSelectedLoops(self, lps):
        res = []
        testLoops = set(lps)
        for ss in self.Surfaces:
            surfaceLoops = set(ss.getLoops())
            if len(surfaceLoops.intersection(testLoops)) == len(surfaceLoops):
                res.append(ss)
        
        return(res)
        
    def getBeziersDependentOnAllSelectedPoints(self, pts):
        res = []
        testpts = set(pts)
        for bz in self.BezierCurves:
            bzpts = set(bz.getPoints())
            if len(bzpts.intersection(testpts)) == len(bzpts):
                res.append(bz)
                
        return res 

    def getBSplinesDependentOnAllSelectedPoints(self, pts):
        res = []
        testpts = set(pts)
        for bz in self.BSplineCurves:
            bzpts = set(bz.getPoints())
            if len(bzpts.intersection(testpts)) == len(bzpts):
                res.append(bz)
                
        return res           
        
        
    def getBezierCurvesDependentOnPoint(self, pnt):
        res = []
        for bz in self.BezierCurves:
            if pnt in bz.getPoints():
                res.append(bz)     
        return res        
        
    def getBSplineCurvesDependentOnPoint(self, pnt):
        res = []
        for bs in self.BSplineCurves:
            if pnt in bs.getPoints():
                res.append(bs)               
        return res        
        
    def getLoopsInsideLoop(self, loop):  
        if self.getNumLoops() <= 1: return []
        from shapely.geometry.polygon import Polygon
            
        poly = Polygon(loop.getCoordinates())
        res = []
        
        for lptest in self.Loops:
            if lptest==loop: continue
            if poly.contains(Polygon(lptest.getCoordinates())): res.append(lptest)
         

        return res
        
    def getCirclesInsideLoop(self, loop):
        if self.getNumCircles() ==0: return []
        from shapely.geometry.polygon import Polygon
            
        poly = Polygon(loop.getCoordinates())
        res = []
        
        for cctest in self.Circles:
            if poly.contains(Polygon(cctest.getRendering())): res.append(cctest)
          
        return res
        
    def getMeshStats(self):
        numNodes = 0
        numElements = 0
        for surf in self.Surfaces:
            numNodes += surf.getNumNodes()
            numElements += surf.getNumElements()
        return [numNodes, numElements]    
    
    
    
