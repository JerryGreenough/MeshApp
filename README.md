# MeshApp
A web application with CAD and meshing functionality.
The application demonstrates how some of the ingredients required of a geometry modeller can be incorporated into a web-based application. 
The benefits of such an approach are:

1.
2.
3.

## Deployment

MeshApp requires that a python script, namely ```flask_app.py``` be run. A version 3.9 (or above) of Python is therefore required.
In order to run the application locally, issue the following command from the console.

```python flask_app.py```

This will start the back end server, which receives, prcoesses and sends HTTP requests in conjunction with a web client (or front end). 
The web client is launched by opening a web browser and then browsing to ```localhost:5000``` in the address bar.


## Operation

Left-click on anywhere in the graphics area to generate points.
Click on the polygon option from the top menu to create a polygon. The outer boundary of the convex hull of the points can be created be ensuring 
the polygon method slider from the right hand menu is set to 'Convex Hull'.
Polygons can be meshed with either triangular or quadrilateral elements. Use the mesh type slider on the right hand menu to decide which.

## Acknowledgments

The application uses various components of the following Python libraries.

shapely
scipy
numpy
gmsh

as well as Flask.