import scipy.special as ss
import numpy as np

class bezier:
    def __init__(self, vertices):
    
        # Instantiate a Bezier evaluation object.
        # Generate the coefficients required to
        # calculate a Bezier curve. C(n,i) calculates the
        # binomial coefficient n! / (i! (n-i)!)
        
        self.n = len(vertices) - 1
        self.coeffs = [ ss.binom(self.n, i) for i in range(0,len(vertices)) ]
        self.vertices = np.array(vertices)
        
    def evaluate(self, t):
        
        pt = np.zeros_like(self.vertices[0])
   
        for i in range(0, self.n+1):
            pt = pt + self.vertices[i] * self.coeffs[i] * t**i * (1.0-t)**(self.n - i)
            
        return pt

        
        
class Bernstein:
    def __init__(self, N):
        self.N = N
        self.coeffs = [ss.binom(N, i) for i in range(0,N+1)]
         

    def evaluate(self, i, t):  
        return self.coeffs[i] * t**i * (1.0-t)**(self.N - i)    
        
        
        
        
def bezierInterpolate(interpolationPoints, degree, fixedEndPoints = True):            
    
    Npts = len(interpolationPoints)  
    N = Npts - 1
                    
    if(degree==0): degree = N    # 0 implies the degree of the curve 
                                 # is set to the number of interpolation points.
                    
    h = 1.0 / N  # parameter spacing (one knot per interpolation point)
    
    # Calculate knot locations
        
    bc = Bernstein(degree)
    
    F = []
    
    for i in range(0, Npts):
        tval = i * h                       
        F.append([bc.evaluate(j, tval) for j in range(0, degree+1)])
                        
    F = np.array(F)
    
    if fixedEndPoints:
        if degree == N:
            Finv = np.linalg.inv(F)
            polygon = np.matmul(Finv, np.array(interpolationPoints))
        else:
            sp = np.array(interpolationPoints[0])
            ep = np.array(interpolationPoints[-1])
            
            polygon = np.array(interpolationPoints[1:N])
        
            M = F[1:N, 1:degree]
            MT = np.transpose(M)
                        
            MTM = np.matmul(MT,M)
            Minv = np.linalg.inv(MTM)
                   
            for i in range(1,N):
                tval = i * h   
                polygon[i-1] = polygon[i-1] -  sp * (1.0-tval)**degree - ep *tval**degree
                        
            polygon = np.matmul(MT, polygon)
            polygon = np.matmul(Minv, polygon)
            polygon = np.vstack([sp, polygon])
            polygon = np.vstack([polygon, ep])                    
           
    else:
        FT = np.transpose(F)
        FTF = np.matmul(FT, F)
        Finv = np.linalg.inv(FTF)
        
        polygon = np.matmul(FT, np.array(interpolationPoints))
        polygon = np.matmul(Finv, polygon)  
    
    polygon = polygon.tolist()
    bc = bezier(polygon)
    
    points = []
    
    for i in range(101):
        param = 0.01*i
        renderPoint = bc.evaluate(param).tolist()
        points.append(renderPoint)
        
        
    return [points, polygon]

    
def moveBezierInterpolationPoint(oldControlPolygon, interpolationPoints, tparam, movement):

    # Use only if the number of interpolation points (including fixed endpoints)
    # is equal to the number of control polygon points.
    
    newControlPolygon = oldControlPolygon
  
    Npts = len(newControlPolygon)  
    Npts_inter = len(interpolationPoints) + 2  # add in the endpoints
    
    #reminder: need Npts == Npts_inter:
    
    N = Npts - 1
    
    bc = Bernstein(N)
    Avec = [bc.evaluate(j, tparam) for j in range(1, N)]
    
    a = np.dot(Avec, Avec)
    
    for i in range(1,N):
        fac = Avec[i-1] / a
        newControlPolygon[i][0] += movement[0]*fac
        newControlPolygon[i][1] += movement[1]*fac
           
    bc1 = bezier(newControlPolygon)
    
    points = []
    for i in range(101):
        param = 0.01*i
        renderPoint = bc1.evaluate(param).tolist()
        points.append(renderPoint)
    
    # Update the internal interpolation points. These do not include the
    # start and finish points.
    
    newInternalPoints = []
    N = len(interpolationPoints) + 1
    
    h = 1.0 / N
                    
    for i in range(1, N):
        tval = i * h  
        renderPoint = bc1.evaluate(tval).tolist()
        newInternalPoints.append(renderPoint) 

    return [points, newControlPolygon, newInteralPoints]
    