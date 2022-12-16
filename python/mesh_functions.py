from python.db import DB
from python.DB_Surfaces import DB_Surfaces, Surface

def meshReport(DBsession):
    DBsession.meshList = []
    for sm in DBsession.Surfaces:
           
        if sm.hasMesh():
            mesh = sm.getMesh()
            xyz = mesh['nodes']
            ndcoords = [[ixyz+1, round(xyz[0],2), round(xyz[1],2)] for ixyz, xyz in enumerate(xyz)]
            elems = []
            
            if len(mesh['triElements'])>0: 
                elems.extend([[q+1 for q in ndlist] for ndlist in mesh['triElements']])
            
            if len(mesh['quadElements'])>0: 
                elems.extend([[q+1 for q in ndlist] for ndlist in mesh['quadElements']])
    
                
            DBsession.meshList.append([ndcoords, elems])