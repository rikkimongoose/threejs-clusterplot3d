threejs-clusterplot3d
=====================
Interactive 3D plot for cluster analysis for JavaScript. Based on [ThreeJS](http://threejs.org/) for WebGL.]

*The project is closed. For 3D cluster plotting check [vis](http://visjs.org) library, especially [the following example](http://visjs.org/examples/graph3d/08_dot_cloud_size.html)*

## Usage

The simplest way to draw the plot is using the function **THREEx.doPlot3d** (same as it's used in jQuery):

**THREEx.doPlot3d(containerId, data, dataOptions, plotOptions, onItemLoad, onItemsLoad, onBeforeLoad, onPlotHover, onPlotHoverOut)**

Paramd:

* **containerId** — id of DOM element for the plot.
* **data** — plot data. Array of indexed collections (objects or arrays) is required.
* **dataOptions** — data view options.
* **plotOptions** — plot options. *Optional*.
* **onItemLoad** — callback function. Executes, when new element is added to plot. *Optional*.
* **onItemsLoad** — callback function. Executes, when adding of elements to the plot is completed. *Optional*.
* **onBeforeLoad** — callback function. Executes before the loading of elements is started. *Optional*.
* **onPlotHover** — callback function. Executes, when an element in selected. *Optional*.
* **onPlotHoverOut** — callback function. Executes, when the selection is off. *Optional*.
 
Example:

Add libraries:

```html
<script src="js/three.min.js"></script>
<script src="js/THREEx.Plot3d.min.js"></script>
```

Create DOM objects:

```html
<style>
    canvas { width: 100%; height: 100% }
</style>
<script src="js/jquery-1.9.1.js"></script>
<script src="js/jquery-ui.js"></script>
<link rel=stylesheet href="css/jquery-ui.css" />

<div id="ThreeJS" style="z-index: 2; left:0px; top:0px; width: 100%; height:100%;"></div>
```

Draw:

```javascript
$(function() {
    var sourceData = [
      [0,0,0,5, "color1"],
      [10,10,10,5, "color2"],
      [20, 20, 20, 5, "color3"]
    ];
    var plot = THREEx.doPlot3d(
      "ThreeJS",
      sourceData,
      { color : 4, type_const : THREEx.PLOT_TYPE.ITEM.SPHERE },
      { x : 0, y : 1, z : 2, size : 3 }
    );
});
```

If there're a lot of elements (>200), it's better to use particle mode:

```javascript
$(function() {
    var sourceData = [
        [4, 59, 1],
        [4, 50, 1],
        [1, 40, 1],
        
        //...1 000 elements more...
        
        [111, 0, 0],
    ];
    
    var plot = THREEx.doPlot3d(
        "ThreeJS",
        sourceData,
        { color: 2 },
        {
            colorBackgroundBox : 0x000000,
            itemViewMode : THREEx.CONST_ITEMS_MODE.PARTICLE,
            axisLabelFrontColor : 0x000000,
            axisLabelSideColor : 0xffffff,
            axisLabelBevelSize : 1
        }
    );
});
```

## Other functions and objects

### THREEx.ClusterPlot3d

Main object of this library. Extends THREE.js with interactive 3D cluster plot object.

Function **THREEx.doPlot3d** covers this class, letting to create the plot with one call.

Class supports methods chaining.

Example:

```javascript
var data = [
    [0,0,0,5, "color1"],
    [10,10,10,5, "color2"],
    [20, 20, 20, 5, "color3"]
];
var containerId = "ThreeJS";
var plotOptions = {};
var dataOptions = { color : 4, type_const : THREEx.PLOT_TYPE.ITEM.SPHERE },

var cluster3d = new THREEx.ClusterPlot3d(plotOptions)
    .doDrawBackground(containerId)
    .doParseData(data, dataOptions)
    .doDrawData();
```

Class methods:

* **THREEx.ClusterPlot3d(plotOptions)** — class constructor. *plotOptions* define the options for whole plot.
* **doDrawBackground(elemId)** — draw background and coordinate box at DOM object with ID equals to *elemId*.
* **doClear()** — clear the plot.
* **doParseData(data, dataOptions)** — load plot data. **data** hasis array of indexed collections (arrays or objects). **dataOptions** defines the view options.
* **doDrawData()** — show data on plot

Event methods:

* **addEvent(eventTitle, func)** — add event  *eventTitle*. Название события передаётся в строке, например: *'onItemLoad'*
* **execEvent(eventTitle, e)** — execute functions for *eventTitle*, passing param *e*.

Allowed events:

* *onItemLoad* — executes, when an element is added to plot.
* *onItemsLoaded* — executes, when adding of elements to the plot is completed.
* *onBeforeLoad* — executes before the loading of elements is started.
* *onPlotHover* — executes when an element in selected.
* *onPlotHoverOut* — executes when the selection is off.

## Options

### Data options (dataOptions)

Defines the index in data source element that has to be used as param on plot. If value of color, or shapem or position has to be fixed, use postfix **_const**, like this:

```javascript
{ color: 2, material_const : THREEx.PLOT_TYPE.MATERIAL.BASIC }
```

* **title** — Data element title. Default *null*.
* **x** — Index in source data for X axis. Default *0*.
* **y** — Index in source data for Y axis. Default *1*.
* **z** — Index in source data for Z axis. Default *2*.
* **color** — Color for data element. Default value is const *0xff0000* (red).
* **outlineColor** — Color for halo of data element. Default value is const *null*.
* **outlineExpand** — Halo size. Default *1.2*. This param is used only if **outlineColor** is not *null*.
* **material** — elements material. This param is used only if **itemViewMode** is equal to *THREEx.CONST_ITEMS_MODE.GEOMETRY*. Default *THREEx.PLOT_TYPE.MATERIAL.LAMBER*. Possible values:
  - *THREEx.PLOT_TYPE.MATERIAL.BASIC*
  - *THREEx.PLOT_TYPE.MATERIAL.LAMBER*
  - *THREEx.PLOT_TYPE.MATERIAL.PHONG*
* **size** — Element size. Default *3*.
* **type** — Element shape. Will be changed, if **itemViewMode** is *THREEx.CONST_ITEMS_MODE.GEOMETRY*. Default *THREEx.PLOT_TYPE.ITEM.CUBE*. Possible values:
  - *THREEx.PLOT_TYPE.MATERIAL.SPHERE* — sphere
  - *THREEx.PLOT_TYPE.MATERIAL.CUBE* — cube
  - *THREEx.PLOT_TYPE.MATERIAL.BAR* — vertical bar

### Plot options (plotOptions)

#### Background

* **showSkybox** — Show the background skybox. If set it to *true*, you will see the default black background. There're bugs in Internet Explorer 9 when skybox is off, so it's recommended to leave default value.Default *true*.
* **colorBackgroundBox** — Background color. Default *0xffffff*.

#### Light source

* **lightX** — X of light source. Default *400*.
* **lightY** — Y of light source. Default *300*.
* **lightZ** — Z of light source. Default *400*.
* **colorLight** — Light color. Default *0xffffff* (white).

#### Plot

* **colorXZ** — color for box wall between X and Z. Default *0x006600*.
* **colorXZCentral** — color for central lines of box wall between X and Z. Default *0x00ff00*.
* **сolorXY** — color for box wall between X and Y. Default *0x000066*.
* **colorXYCentral** — color for central lines of box wall between X and Y. Default *0x0000ff*.
* **сolorYZ** — color for box wall between Y and Z. Default *0x660000*.
* **colorYZCentral** — color for central lines of box wall between Y and Z. Default *0xff0000*.
* **stepsSize** — Box wall size. Default *100*.
* **stepsCount** — Box wall element size. Default *20*.

#### Data

* **stratch** — Stratch elements by plot. Default *true*.
* **showGrids** — show box walls. Default *true*.

#### Camera

* **cameraX** — X of camera position. Default *400*.
* **cameraY** — Y of camera position. Default *300*.
* **cameraZ** — Z of camera position. Default *400*.
* **cameraAngle** — camera angle (degrees). Default *45*.

#### Palette
* **palette** — Plot palette. Default *THREEx.COLOR_PALETTE_TYPE.HSL*. Possible variants:
  - *THREEx.COLOR_PALETTE_TYPE.HSL* — all possible colors (based on HSL palette)
  - *THREEx.COLOR_PALETTE_TYPE.SEMAPHORE* — Reg-Yellow-Green and all of colors between
  - *THREEx.COLOR_PALETTE_TYPE.ICE* — warm shades
  - *THREEx.COLOR_PALETTE_TYPE.HOT* — cold shades

* **highlightSelected** — Hightlight the selected element. Default *true*. If mode is *THREEx.CONST_ITEMS_MODE.PARTICLE* highlighting doesn't work.
* **selectedItemColor** — Color of selected element's highlighting. Default *0xffffff*.
* **itemViewMode** — Element's drawing mode. Default *THREEx.CONST_ITEMS_MODE.GEOMETRY*. Posible variants:
  - *THREEx.CONST_ITEMS_MODE.GEOMETRY* — standart geometry. Different materials are allowed, the selection of element is supported.
  - *THREEx.CONST_ITEMS_MODE.PARTICLE* — drawing in particicles mode. No support of materials or element selection, but works much better for a lot of elements (>1 000).

#### Axis labels

* **showAxisLabels** — Show axis labels. Default *true*.
* **axisLabelX** — Label for axis X. Default *x*.
* **axisLabelY** — Label for axis Y. Default *y*.
* **axisLabelZ** — Label for axis Z. Default *z*.

##### Axis label font

* **axisLabelFont** — Axis label font. Default *THREEx.FONT.helvetiker*. Allowed:
  - *THREEx.CONST_ITEMS_MODE.gentilis*
  - *THREEx.CONST_ITEMS_MODE.helvetiker*
  - *THREEx.CONST_ITEMS_MODE.optimer*
  - *THREEx.CONST_ITEMS_MODE.droid_sans*
  - *THREEx.CONST_ITEMS_MODE.droid_serif*
* **axisLabelCurveSegments** — Curve segments. Default *0*.
* **axisLabelFrontColor** — Middle color for axis label. Default *0xffffff*.
* **axisLabelSideColor** — Side color for axis label. Default *0x000000*.
* **axisLabelSize** — Label size. Default *18*.
* **axisLabelHeight** — Label height. Default *4*.
* **axisLabelBevelEnabled** — Use bevel. Default *true*.
* **axisLabelBevelSize** — Bevel size. Default *2*.
* **axisLabelBevelThickness** — Bevel thickness. Default *1*.
