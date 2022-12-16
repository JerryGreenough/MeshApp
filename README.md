# MeshApp
A web application with CAD and meshing functionality.
The application demonstrates how some of the ingredients required of a geometry modeller can be incorporated into a web-based application. 
The benefits of such an approach are:

1.	No need for the user to be involved in the process of installation.
2.	Simple and near instant maintainability for the developer.
3.	For larger projects, the user would be able to make use of high performance distibuted compuitations as well as the storage capabilities of cloud-based hardware.

## Deployment

MeshApp requires that a python script, namely ```flask_app.py``` be run. A version 3.9 (or above) of Python is therefore required.
In order to run the application locally, issue the following command from the console.

```python flask_app.py```

This will start the back end server, which receives, prcoesses and sends HTTP requests in conjunction with a web client (or front end). 
The web client is launched by opening a web browser and then browsing to ```localhost:5000``` in the address bar.


## Operation

Left-click on the graphics area to generate points. Point locations are snapped to the nearest 5 units. Exact point coordinates may be specified by right clicking
on the point and entering the required co-ordinates in the dialogue box.

<p>
Click on the polygon option from the top menu to create a polygon from the points in the graphics area. The outer boundary of the convex hull of the points can be created by ensuring 
the 'Polygon Method' slider from the right hand menu is set to 'Convex Hull' .. otherwise the polygon vertices appear in the order of point creation. 
Polygons can also be created from selected groups of points. The selection of points is achieved by left clicking on one corner of the selection area and then dragging the cursor
to the opposite corner. The selected points are then highlighted by concentric circles. Click the 'Polygon' option to create polygons from the selected points.
</p>
<p>
Polygons can be meshed with either triangular or quadrilateral elements. Use the 'Element Type' slider on the right hand menu to decide which. 
When choosing the quadrilateral element type, it should be noted that the mesh that is generated is quadrilateral dominant 
rather than being composed purely of quadrilaterals. Meshes can be made denser or coarser by right clicking on a point (or a selection of points) and then changing the element size
option that appears in the dialogue box.
</p>
A textual representation of a mesh can be exported by clicking on the 'Summary' option of the top menu.

## Acknowledgments

The application uses various components of the excellent work that can be found in the following Python libraries.
```
shapely
scipy
numpy
gmsh
```

as well as ```Flask```.