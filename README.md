# MeshApp
A web application with CAD and meshing functionality.

In order to run the application locally, issue the following command from the console.

```python flask_app.py```

This will start the back end server, which receives, prcoesses and sends HTTP requests in conjunction with a web client (or front end). 
The front end is launched by opening a web browser and then typing ```localhost:5000``` in the address bar.


## Operation

Left-click on anywhere in the graphics area to generate points.
Click on the polygon option from the top menu to create a polygon. The outer boundary of the convex hull of the points can be created be ensuring 
the polygon method slider from the right hand menu is set to 'Convex Hu''.
Polygons can be meshed with either triangular or quadrilateral elements. Use the mesh type slider on the right hand menu to decide which.