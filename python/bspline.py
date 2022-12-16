import scipy.special as ss
from scipy.interpolate import BSpline as BSPL
from scipy.interpolate import splprep
import numpy as np

        
def bSplineInterpolate(interpolationPoints, degree, fixedEndPoints = True):  
    x = np.array([ q[0] for q in interpolationPoints])
    y = np.array([ q[1] for q in interpolationPoints])
    
    degree = min(degree, 5)

    [knots, coords, degree], u = splprep([x,y], ub=0, ue=1, k=degree)
    
    rendering = []
    
    coords = list(zip(coords[0].tolist(), coords[1].tolist()))

    spl = BSPL(knots, coords, degree)
    
    for i in range(101):
        param = knots[0] + 0.01*i *(knots[-1] - knots[0])
        renderPoint = spl(param).tolist()
        rendering.append(renderPoint)           
            
    return [rendering, coords, knots, degree]

    
