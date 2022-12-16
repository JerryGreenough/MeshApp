import numpy as np

def meshQuality(xyzList, quadList, numnod):

    badlist = []
    
    for ix, qq in enumerate(quadList):
        nodeCoords = []
        for cc in qq:
            nodeCoords.append(xyzList[cc])

        angles = []
        for ii in range(numnod):
            c1 = nodeCoords[(ii-1)%numnod]
            c2 = nodeCoords[ii]
            c3 = nodeCoords[(ii+1)%numnod]
            angles.append(angCalc(c1, c2, c3))
            
        if any([x for x in angles]): badlist.append(int(ix))

    
    return badlist
    
    
def angCalc(c1, c2, c3):

    # Returns False if the angle is OK (> 30.0 degrees).

    a = [c2[0]-c1[0], c2[1]-c1[1]]
    b = [c3[0]-c2[0], c3[1]-c2[1]]
    
    disc = a[0]*b[1] - a[1]*b[0]
    
    res = True
    if disc**2 > 0.25 * (a[0]**2 + a[1]**2) * (b[0]**2 + b[1]**2): res = False
    
    return res