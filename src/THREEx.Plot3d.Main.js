/*
ThreeJS Cluster Plot 3D

3D clustering plot based on ThreeJS library.

by Rikki Mongoose

See updates at http://github.com/rikkimongoose/threejs-clusterplot3d 

*/


/** @namespace */
var THREEx	= THREEx || {};

/*
* Store all created 3D plots
*/
if(THREEx._plots3d === undefined) {
	THREEx._plots3d = [];
}

/*
* Types of objects for plot
*/
THREEx.PLOT_TYPE =
	{
		ITEM :
		{
			SPHERE : 0,
			CUBE : 1
		},
		MATERIAL :
		{
			BASIC : 0,
			LAMBER : 1,
			PHONG : 2
		}
	};

/*
* Geometry for plot
*/
THREEx.CONST_GEO =
	{
		SPHERE :
		{
			SEGMENTS :
			{
				WIDTH : 32,
				HEIGHT : 16
			}
		},
		CUBE :
		{
			Z_DEPTH : 1
		},
		MODE :
		{
			OUTLINE : {
				NO : 0,
				YES : 1,
				HOVER : 2
			}
		}
	};

THREEx.CONST_ITEMS_MODE =
	{
		GEOMETRY : 0,
		PARTICLE : 1
	};

THREEx.FONT = {
		gentilis : "gentilis",
		helvetiker : "helvetiker",
		optimer : "optimer",
		droid_sans : "droid sans",
		droid_serif : "droid serif"
	};

THREEx.ClusterPlot3d = function(plotOptions) {
	this.keyboard = new THREEx.KeyboardState();
	this.clock = new THREE.Clock
	this.projector = new THREE.Projector();
	
	var defaultPlotOptions = {
		showStats : false,
		stratch : true,
		showGrids : true,

		colorBackgroundBox : 0xffffff,
		colorLight : 0xffffff,

		colorXZ : 0x006600,
		colorXZCentral : 0x00ff00,
		colorXY : 0x000066,
		colorXYCentral : 0x0000ff,
		colorYZ : 0x660000,
		colorYZCentral : 0xff0000,

		cameraX : 400,
		cameraY : 300,
		cameraZ : 400,
		cameraAngle : 45,

		lightX : 400,
		lightY : 300,
		lightZ : 400,

		stepsSize : 100,
		stepsCount : 20,
		palette : THREEx.COLOR_PALETTE_TYPE.HSL,

		showSkybox : true,
		highlightSelected : true,
		showHint : true,
		selectedItemColor : 0xffffff,
		hintColor : 0xffff00,
		hintColorBorder : 0x000000,

		itemViewMode : THREEx.CONST_ITEMS_MODE.GEOMETRY,

		showAxisLabels : true,

		axisLabelX : 'x',
		axisLabelY : 'y',
		axisLabelZ : 'z',

		axisLabelFont : THREEx.FONT.helvetiker,
		axisLabelCurveSegments : 0,
		axisLabelFrontColor : 0xffffff,
		axisLabelSideColor : 0x000000,
		axisLabelSize : 18,
		axisLabelHeight : 4,
		axisLabelBevelEnabled : true,
		axisLabelBevelSize : 2,
		axisLabelBevelThickness : 1
	};

	this.options = {};

	if(plotOptions !== undefined){
		for(var opt_key in defaultPlotOptions)
			this.options[opt_key] = (plotOptions[opt_key] !== undefined) ? plotOptions[opt_key] : defaultPlotOptions[opt_key];
	} else {
		for(var opt_key in defaultPlotOptions)
			this.options[opt_key] = defaultPlotOptions[opt_key];
	}

	this.options.stepsStep = (this.options.stepsSize / this.options.stepsCount) * 2;
	this.options.stepsCountKoeff = this.options.stepsStep;

	this.intersecred = null;
	this.hintSprite = null;
	this.mouse = null;
    
	THREEx._plots3d.push(this);
	
	this.onDocumentMouseMove = function( event ) 
	{
		// the following line would stop any other event handler from firing
		// (such as the mouse's TrackballControls)
		// event.preventDefault();

		// update sprite position
		/*if(this.showHint && this.hintSprite) {
			this.hintSprite.position.set( event.clientX, event.clientY - 20, 0 );
		}*/
		//console.log(event.clientX + 'x' + event.clientY);
		// update the mouse variable
		this.mouse = {
			x : ( event.clientX / this.renderer.domElement.clientWidth )  * 2 - 1,
			y : -( event.clientY / this.renderer.domElement.clientHeight ) * 2 + 1
		};
	};

	this.init = function() {
		this.scene = new THREE.Scene();
		// CAMERA
		var screenWidth = this.container.clientWidth,
			screenHeight = this.container.clientHeight,

			viewAngle = this.options.cameraAngle,
			aspect = screenWidth / screenHeight,
			near = 0.1,
			far = 20000;

		this.camera = new THREE.PerspectiveCamera( viewAngle, aspect, near, far);
		this.scene.add(this.camera);
		this.camera.position.set(this.options.cameraX, this.options.cameraY, this.options.cameraZ);
		this.camera.lookAt(this.scene.position);	
		
		// RENDERER
		if ( Detector.webgl )
			this.renderer = new THREE.WebGLRenderer( {antialias:true} );
		else
			this.renderer = new THREE.CanvasRenderer(); 
		this.renderer.setSize(screenWidth, screenHeight);

		this.container.appendChild( this.renderer.domElement );

		this.container.addEventListener( 'mousemove', this.onDocumentMouseMove.bind(this), false );
		
		// EVENTS
		THREEx.WindowResize(this.renderer, this.camera);
		THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

		// CONTROLS
		this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
		
		if(this.options.showStats){
			// STATS
			this.stats = new Stats();
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.bottom = '0px';
			this.stats.domElement.style.zIndex = 100;
			this.container.appendChild( this.stats.domElement );
		} else {
			this.stats = null;
		}

		// LIGHT
		this.options.lightX = this.options.stepsSize * 4;
		this.options.lightY = this.options.stepsSize * 3;
		this.options.lightZ = this.options.stepsSize * 4;

		var light = new THREE.PointLight(this.options.colorLight);
		light.position.set(this.options.lightX, this.options.lightY, this.options.lightZ);
		this.scene.add(light);


		var light2 = new THREE.PointLight(this.options.colorLight);
		light2.position.set(0, 0, 0);
		this.scene.add(light2);

		this.intersected = null;

		// SKYBOX
		if(this.options.showSkybox) {
			var skyBoxGeometry = new THREE.BoxGeometry( 10000, 10000, 10000 );
			var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: this.options.colorBackgroundBox, side: THREE.BackSide } );
			var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
			skyBox.name=null;
			this.scene.add(skyBox);
		}
	}

	this.animate = function() {
    	requestAnimationFrame(this.animate.bind(this));
		this.render();
		this.update();
	};

	this.update = function(){
		if ( this.keyboard.pressed("z") ) 
		{	// do something   
		}
		if(this.mouse) {
			// create a Ray with origin at the mouse position
			//   and direction into the scene (camera direction)
				var vector = new THREE.Vector3( this.mouse.x, this.mouse.y, 1 );
				this.projector.unprojectVector( vector, this.camera );
				var ray = new THREE.Raycaster( this.camera.position, vector.sub( this.camera.position ).normalize() );
				// create an array containing all objects in the scene with which the ray intersects
				var intersectsRaw = ray.intersectObjects( this.scene.children, true );
				var intersects = [];

				for(var i = 0, l = intersectsRaw.length; i < l; i++){
					if(intersectsRaw[i].object.name)
						intersects.push(intersectsRaw[i]);
				}

				// this.intersected = the object in the scene currently closest to the camera 
				//		and this.intersected by the Ray projected from the mouse position 	
				// if there is one (or more) intersections
				if ( intersects.length )
				{
					var c = 0;
					for(var interIndex = 0, l = intersects.length; interIndex < l; interIndex++){
						var intersectObj = intersects[interIndex].object;
						if ( intersectObj != this.intersected && intersectObj.name ) 
						{
							if (this.intersected && this.intersected.currentHex !== undefined && this.intersected.currentHex){
								this.intersected.material.color.setHex( this.intersected.currentHex );
							}
							
							// store reference to closest object as current intersection object
							this.intersected = intersectObj;
							if(this.options.highlightSelected) {
								// store color of closest object (for later restoration)
								this.intersected.currentHex = this.intersected.material.color.getHex();
								// set a new color for closest object
								this.intersected.material.color.setHex( this.options.selectedItemColor );
							}
							this.execEvent('onPlotHover', { mashItem : this.intersected, item : this.intersected ? this.intersected.itemData : null, mouse : this.mouse });
							break;	
						}
					}
				} 
				else // there are no intersections
				{
					// restore previous intersection object (if it exists) to its original color
					// remove previous intersection object reference
					//     by setting current intersection object to "nothing"

					if ( this.intersected ) {
						this.intersected.material.color.setHex( this.intersected.currentHex );
						this.execEvent('onPlotHoverOut', { mashItem : this.intersected, item : this.intersected.itemData, mouse : this.mouse });
					}
					this.intersected = null;
				}
		}
		this.controls.update();
		if(this.stats)
			this.stats.update();
	};

	this.render = function() {
		this.renderer.render( this.scene, this.camera );
	};

	this.gridOptions = {
		xz : {
			size : this.options.stepsSize,
			step : this.options.stepsStep
		},
		xy : {
			size : this.options.stepsSize,
			step : this.options.stepsStep
		},
		yz : {
			size : this.options.stepsSize,
			step : this.options.stepsStep
		}
	};

	var AXIS_TYPE = {
		X : 1,
		Y : 2,
		Z : 3
	};

	this.grids = function() {
		var halfPI = Math.PI/2;

		var gridXZ = new THREE.GridHelper(this.gridOptions.xz.size, this.gridOptions.xz.step);
		gridXZ.setColors( new THREE.Color(this.options.colorXZCentral), new THREE.Color(this.options.colorXZ) );
		gridXZ.position.set( this.options.stepsSize, 0, this.options.stepsSize );
		this.scene.add(gridXZ);
			
		var gridXY = new THREE.GridHelper(this.gridOptions.xy.size, this.gridOptions.xy.step);
		gridXY.position.set( this.options.stepsSize, this.options.stepsSize, 0 );
		gridXY.rotation.x = halfPI;
		gridXY.setColors( new THREE.Color(this.options.colorXYCentral), new THREE.Color(this.options.colorXY) );
		this.scene.add(gridXY);

		var gridYZ = new THREE.GridHelper(this.gridOptions.yz.size, this.gridOptions.yz.step);
		gridYZ.position.set( 0, this.options.stepsSize, this.options.stepsSize );
		gridYZ.rotation.z = halfPI;
		gridYZ.setColors( new THREE.Color(this.options.colorYZCentral), new THREE.Color(this.options.colorYZ) );
		this.scene.add(gridYZ);

		this.gridXZ = gridXZ;
		this.gridXY = gridXY;
		this.gridYZ = gridYZ;

		var axis_types = [ AXIS_TYPE.X, AXIS_TYPE.Y, AXIS_TYPE.Z];
		if(this.options.showAxisLabels)
			for(var axit_type_index in axis_types)
				this.createAxisLabel(axis_types[axit_type_index]);
		/* Temporary removed. Will be in next versions.
		
		if(this.options.showAxisNumbers)
			for(var axit_type_index in axis_types)
				this.createAxisNumberLabel(axis_types[axit_type_index]);
		*/
	};

	this.createAxisLabel = function(axis_type){
		var textMesh = this.getAxisLabel(axis_type);
		this.scene.add(textMesh);
	}


	this.createAxisNumberLabel = function(axis_type){
	    var gridProperties = this.getGridProperties(axis_type);
		for(var pos = 0; pos <= gridProperties.size; pos += gridProperties.step) {
			var textMesh = this.getAxisNumber(axis_type, pos, pos);
			this.scene.add(textMesh);
		}
	}
	
	this.getAxisLabelTitle = function(axis_type){
	    switch(axis_type){
	    	case AXIS_TYPE.X : return this.options.axisLabelX;
	    	case AXIS_TYPE.Y : return this.options.axisLabelY;
	    	case AXIS_TYPE.Z : return this.options.axisLabelZ;
	    }
	    return "";
	}

	this.getAxisLabel = function(axis_type){
	    var materialFront = new THREE.MeshBasicMaterial({
	        color: this.options.axisLabelFrontColor
	    });
	    var materialSide = new THREE.MeshBasicMaterial({
	        color: this.options.axisLabelSideColor
	    });
	    var materialArray = [materialFront, materialSide];
	    var textGeom = new THREE.TextGeometry(this.getAxisLabelTitle(axis_type), {
	        size: this.options.axisLabelSize,
	        height: this.options.axisLabelHeight,
	        curveSegments: this.options.axisLabelCurveSegments,
	        font: this.options.axisLabelFont,
	        bevelThickness: this.options.axisLabelBevelThickness,
	        bevelSize: this.options.axisLabelBevelSize,
	        bevelEnabled: this.options.axisLabelBevelEnabled,
	        material: 0,
	        extrudeMaterial: 1
	    });

	    // font: helvetiker, gentilis, droid sans, droid serif, optimer
	    // weight: normal, bold

	    var textMaterial = new THREE.MeshFaceMaterial(materialArray);
	    var textMesh = new THREE.Mesh(textGeom, textMaterial);
	    var textBound = getTextBound(textGeom);
	    var gridProperties = this.getGridProperties(axis_type);
	    setAxisMeshPosition(textMesh, axis_type, gridProperties.size * 2, textBound);
	    return textMesh;
	}

	this.getGridProperties = function(axis_type){
    	switch(axis_type){
    		case AXIS_TYPE.X : return this.gridOptions.yz;
    		case AXIS_TYPE.Y : return this.gridOptions.yz;
    		case AXIS_TYPE.Z : return this.gridOptions.yz;   	
    	}
    	return null;
	};

	function getTextBound(text_geom) {
		text_geom.computeBoundingBox();
		return {
	    	Width  : text_geom.boundingBox.max.x - text_geom.boundingBox.min.x,
	    	Height : text_geom.boundingBox.max.y - text_geom.boundingBox.min.y
	    };
	}

	function setAxisMeshPosition(text_mesh, axis_type, grid_size, text_bound){
    	switch(axis_type){
    		case AXIS_TYPE.X:
	    		text_mesh.position.set(grid_size + 10, 0, 0);
    		break;
    		case AXIS_TYPE.Y:
	    		text_mesh.position.set(0, grid_size + text_bound.Height / 2, text_bound.Width  / 2);
    			text_mesh.rotation.y = Math.PI / 4;
    		break;
    		case AXIS_TYPE.Z:
	    		text_mesh.position.set(0, 0, grid_size + text_bound.Width + 10);
    			text_mesh.rotation.y = Math.PI / 2;
    		break;
    	}
	}

	this.getAxisNumber = function(axis_type, pos, value_text){
	    var materialFront = new THREE.MeshBasicMaterial({
	        color: 0xffffff
	    });
	    var materialSide = new THREE.MeshBasicMaterial({
	        color: 0x000000
	    });
	    var materialArray = [materialFront, materialSide];

	    var textGeom = new THREE.TextGeometry(value_text, {
	        size : 5,
	        height: 4,
	        curveSegments: 0,
	        font: 'helvetiker',
	        bevelThickness: 1,
	        bevelSize: 2,
	        bevelEnabled: true,
	        material: 0,
	        extrudeMaterial: 1
	    });

	    // font: helvetiker, gentilis, droid sans, droid serif, optimer
	    // weight: normal, bold

	    var textMaterial = new THREE.MeshFaceMaterial(materialArray);
	    var textMesh = new THREE.Mesh(textGeom, textMaterial);
	    var textBound = getTextBound(textGeom);
	    var gridProperties = this.getGridProperties(axis_type);
	    setAxisMeshPosition(textMesh, axis_type, pos, textBound);
	    return textMesh;
	}

	function getGeometry(item_type, size, position){
		function getSphereGeometry(radius){
			return new THREE.SphereGeometry( radius, THREEx.CONST_GEO.SPHERE.SEGMENTS.WIDTH, THREEx.CONST_GEO.SPHERE.SEGMENTS.HEIGHT);
		}
		function getCubeGeometry(radius){
			return new THREE.BoxGeometry(radius, radius, radius);
		}

		switch(item_type)
		{
			case THREEx.PLOT_TYPE.ITEM.SPHERE : return getSphereGeometry(size);
			case THREEx.PLOT_TYPE.ITEM.CUBE   : return getCubeGeometry(size * 2);
		}

		return null;
	}

	function getMaterial(itemMaterial, itemColor){
		function getBasicMaterial(properties){
			return new THREE.MeshBasicMaterial(properties);
		}

		function getLambertMaterial(properties){
			return new THREE.MeshLambertMaterial(properties);
		}

		function getPhongMaterial(properties) {
			return new THREE.MeshPhongMaterial(properties);
		}

		switch(itemMaterial)
		{
			case THREEx.PLOT_TYPE.MATERIAL.BASIC  : return getBasicMaterial( { color: itemColor } );
			case THREEx.PLOT_TYPE.MATERIAL.LAMBER : return getLambertMaterial( { color: itemColor } );
			case THREEx.PLOT_TYPE.MATERIAL.PHONG  : return getPhongMaterial( { color: itemColor } );
		}
		return null;
	}
	
	this.clearPlot = function(){
		while(this.parsedData.length) {
			var itemData = this.parsedData.pop();
			if(itemData.mesh)
				this.scene.remove(itemData.mesh);
			if(itemData.outlineMesh)
				this.scene.remove(itemData.outlineMesh);
		}
	}

	this.drawPlot = function() {
		function drawPlotMaterial(plot, parsedData) {
			var itemDataIndex = parsedData.length;

			while(itemDataIndex--) {
				var itemData = parsedData[itemDataIndex];

				var geometry = getGeometry(itemData.type, itemData.size, itemData);
				var material = getMaterial(itemData.material, itemData.color);
				var mesh = new THREE.Mesh( geometry, material );
				mesh.name = itemData.title;
				mesh.itemData = itemData;

				var pos = {
					x : itemData.x,
					y : itemData.y,
					z : itemData.z
				};

				/*switch(itemData.type)
				{
					case THREEx.PLOT_TYPE.ITEM.BAR:
						mesh.position.set(pos.x, (pos.y - itemData.size / 2) / 2, pos.z);
						break;
					default:*/
				mesh.position.set(pos.x, pos.y, pos.z);
				/*	break;
				}*/

				itemData.mesh = mesh;
				plot.scene.add(mesh);

				if(itemData.outlineColor && itemData.outlineExpand) {
					var outlineMaterial = new THREE.MeshBasicMaterial( { color: itemData.outlineColor, side: THREE.BackSide } );
					var outlineMesh = new THREE.Mesh( geometry, outlineMaterial );
					outlineMesh.position.x = mesh.position.x;
					outlineMesh.position.y = mesh.position.y;
					outlineMesh.position.z = mesh.position.z;
					outlineMesh.scale.multiplyScalar(itemData.outlineExpand);
					itemData.outlineMesh = outlineMesh;
					plot.scene.add( outlineMesh );
				} else {
					itemData.outlineMesh = null;
				}
				plot.execEvent('onItemLoad', { item : itemData });
			}
		}

		function drawPlotParticle(plot, parsedData) {
			function createParticleMaterial(itemData){
			 	return {
			 		color : itemData.color,
			 		size  : itemData.size,
			 		items : []
			 	};
			}

			function cmpParticleMaterials(m1, m2){
				return m1
					&& m2
					&& m1.color == m2.color
					&& m1.size  == m2.size;
			}

			function getParticleMaterial(particleClasses, itemData) {
				var index = particleClasses.length;
				while(index--){
					var particleClass = particleClasses[index];
					if(cmpParticleMaterials(particleClass, itemData))
						return particleClass;
				}
				var newMaterial = createParticleMaterial(itemData);
				particleClasses.push(newMaterial);
				return newMaterial;
			}

			function doShowPatriclesSphere(plot, particleGroups){
				var PI2 = Math.PI * 2;

				var programFill = function ( context ) {
					context.beginPath();
					context.arc( 0, 0, 0.5, 0, PI2, true );
					context.fill();
				};

				for(var i = 0, li = particleGroups.length; i < li; i++) {
					var particleGroup = particleGroups[i],
						geometry = new THREE.Geometry(),
						material = new THREE.SpriteCanvasMaterial({
							color : particleGroup.color || 0xFFFFFF,
							program : programFill
						});
					
					for(var j = 0, lj = particleGroup.items.length; j < lj; j++) {
						var particleGroupData = particleGroup.items[j],
							particle = new THREE.Sprite(material);
						particle.position.x = particleGroupData.x;
						particle.position.y = particleGroupData.y;
						particle.position.z = particleGroupData.z;
						particle.scale.x = particle.scale.y = particleGroup.size;
						geometry.vertices.push(particle);
						plot.execEvent('onItemLoad', { item : particle });
					}
					var system = new THREE.PointCloud(geometry, material);
					plot.scene.add(system);
				}
			}

			function doShowPatriclesCube(plot, particleGroups){
				for(var i = 0, li = particleGroups.length; i < li; i++) {
					var particleGroup = particleGroups[i],
						geometry = new THREE.Geometry(),
						material = new THREE.PointCloudMaterial({
						size : particleGroup.size,
						color : particleGroup.color || 0xFFFFFF,
						vertexColors : false
					});
					
					for(var j = 0, lj = particleGroup.items.length; j < lj; j++) {
						var particleGroupData = particleGroup.items[j],
							particle = new THREE.Vector3(
								particleGroupData.x,
								particleGroupData.y,
								particleGroupData.z
							);
						geometry.vertices.push(particle);
						plot.execEvent('onItemLoad', { item : particle });
					}
					var system = new THREE.PointCloud(geometry, material);
					plot.scene.add(system);
				}
			}

			var particleGroupsSphere = [],
				particleGroupsCube = [];

			for(var itemDataIndex = 0, len = parsedData.length; itemDataIndex < len; itemDataIndex++) {
				var itemData = parsedData[itemDataIndex],
					particleGroups = itemData.type == THREEx.PLOT_TYPE.ITEM.SPHERE ? particleGroupsSphere : particleGroupsCube,
					itemDataMaterial = getParticleMaterial(particleGroups, itemData);

				itemDataMaterial.items.push(itemData);
			}

			doShowPatriclesSphere(plot, particleGroupsSphere);
			doShowPatriclesCube(plot, particleGroupsCube);

		}

		var drawingFunc = null;
		switch(this.options.itemViewMode)
		{
			case THREEx.CONST_ITEMS_MODE.GEOMETRY:
				 drawingFunc = drawPlotMaterial;
			break;
			case THREEx.CONST_ITEMS_MODE.PARTICLE:
				drawingFunc = drawPlotParticle;
			break;
		}
		drawingFunc(this, this.parsedData);
		this.execEvent('onItemsLoaded', { items : this.parsedData });
	}

	var PARSE_RULES_TYPES = {
		CONST : 0,
		NUMERIC : 1,
		COLOR : 2,
		FIGURE : 3,
		MATERIAL : 4
	};

	function makeParseRule(type, isNormalised){
		return { type : type, func : null, isNormalised : isNormalised}
	}

	this.parseRules = {
			x : makeParseRule(PARSE_RULES_TYPES.NUMERIC, true),
			y : makeParseRule(PARSE_RULES_TYPES.NUMERIC, true),
			z : makeParseRule(PARSE_RULES_TYPES.NUMERIC, true),
			title : makeParseRule(PARSE_RULES_TYPES.CONST, false),
			color : makeParseRule(PARSE_RULES_TYPES.COLOR, false),
			outlineColor : makeParseRule(PARSE_RULES_TYPES.COLOR, false),
			outlineExpand : makeParseRule(PARSE_RULES_TYPES.NUMERIC, false),
			material : makeParseRule(PARSE_RULES_TYPES.MATERIAL, false),
			size : makeParseRule(PARSE_RULES_TYPES.NUMERIC, false),
			type : makeParseRule(PARSE_RULES_TYPES.FIGURE, false)
		};

	this.parseRulesDataColumns = [];

	this.prepareParseRules = function(rules) {
		var defaultRulesValues = {
			title : null,
			x : 0,
			y : 0,
			z : 0,
			color : 0xff0000,
			outlineColor : null,
			outlineExpand : 1.2,
			material : THREEx.PLOT_TYPE.MATERIAL.LAMBER,
			size : 1,
			type : THREEx.PLOT_TYPE.ITEM.CUBE
		};

		var ignoredValues = [];

		var defaultRules = {
			title : function(item){ 
					var itemStr = '';
					for(var key in item) {
						if(ignoredValues.indexOf(key) > 0)
							continue;
						var itemVal = item[key];
						if(itemVal === undefined)
							continue;
						itemStr += key + ' : ' + (itemVal != null ? itemVal : 'null' ) + '\n';
					}
					return itemStr;
				},
			x             : function(item) { return (item[0] !== undefined) ? item[0] : defaultRulesValues.x; },
			y             : function(item) { return (item[1] !== undefined) ? item[1] : defaultRulesValues.y; },
			z             : function(item) { return (item[2] !== undefined) ? item[2] : defaultRulesValues.z; },
			size          : function(item) { return (item[3] !== undefined) ? item[3] : defaultRulesValues.size; },
			color         : function() { return defaultRulesValues.color; },
			outlineColor  : function() { return defaultRulesValues.outlineColor; },
			outlineExpand : function() { return defaultRulesValues.outlineExpand; },
			material      : function() { return defaultRulesValues.material; },
			type          : function() { return defaultRulesValues.type; }
		};

		function getRuleValue(ruleKey, isNormalised) {
			if(rules[ruleKey] !== undefined){
				if(typeof rules[ruleKey] == 'function')
					return { func: rules[ruleKey], isChanged : true };
				return { func: function(item) { return item[rules[ruleKey]]; }, isChanged : true };
			}
			var ruleKeyConst = ruleKey + '_const';
			if(rules[ruleKeyConst] !== undefined)
				return { func : function() { return rules[ruleKeyConst] }, isChanged : false };
			if(defaultRules[ruleKey] !== undefined)
				return { func : defaultRules[ruleKey], isChanged : isNormalised };
			return null;
		}

		for(var ruleKey in defaultRules) {
			var ruleValue = getRuleValue(ruleKey, this.parseRules[ruleKey].isNormalised);
			this.parseRules[ruleKey].func = ruleValue.func;
			if(ruleValue.isChanged)
				this.parseRulesDataColumns.push(ruleKey);
		}
	}

	this.background = function(elemId){
		this.execEvent('onBeforeLoad', { items : this.parsedData });
		this.id = elemId;
		this.elementId = elemId;
		this.container = document.getElementById(elemId);
		if(!this.container){
			console.error("Element with id '%s' is not found.", elemId);
			return null;
		}
		
		this.init();
		if(this.options.showGrids)
			this.grids();
		this.animate();

		return this.scene;
	}

	this.normaliseParsedData = function(){
		function mapToAll(items, columnKey, val) {
			var i = items.length;
			while(i--)
				items[i][columnKey] = val;
		}

		function normaliseNumeric(dataToNormalise, key, stepsCount, stepsCountKoeff) {
			var maxValue = Number.NEGATIVE_INFINITY;
			var minValue = Number.POSITIVE_INFINITY;
			var dataLength = dataToNormalise.length;

			var dataKey = dataLength;
			while(dataKey--) {
				var dataItem = dataToNormalise[dataKey][key];
				maxValue = Math.max(dataItem, maxValue);
				minValue = Math.min(dataItem, minValue);
			}

			var koeff = ((maxValue != minValue) ? (stepsCount / (maxValue - minValue)) : stepsCount) * stepsCountKoeff;
			dataKey = dataLength;
			while(dataKey--) {
				var dataItem = dataToNormalise[dataKey][key];
				dataItem = ((maxValue != minValue) ? (dataItem - minValue) : dataItem) * koeff;
				dataToNormalise[dataKey][key] = dataItem;
			}
		}

		function normaliseColor(dataToNormalise, columnKey, palette) {
			var categories = [];
			for(var itemKey in dataToNormalise){
				var itemValue = dataToNormalise[itemKey][columnKey];
				if(categories.indexOf(itemValue) < 0)
					categories.push(itemValue);
			}

			var colors = THREEx.getColorsRange(categories.length);

			for(var itemKey in dataToNormalise){
				var item = dataToNormalise[itemKey];
				item[columnKey] = colors[categories.indexOf(item[columnKey])];				
			}
		}

		function normaliseRange(data, columnKey, types) {
			var maxType = types.length,
				isOverflown = false,
				categoryLinks = {},
				categories = [],
				lastOne = null;

			for(var dataKey in data) {
				var dataItem = data[dataKey];
				var categoryTitle = dataItem[columnKey];
				if(categoryLinks[categoryTitle] === undefined) {
					var numCategory =
					{
						name : categoryTitle,
						items : [dataItem],
						count : 1
					};
					categoryLinks[categoryTitle] = numCategory;
					categories.push(numCategory);
					if(!isOverflown && categories.length > maxType){
						isOverflown = true;
						console.warn("There're more variants then categories in column '%s'", columnKey);
					}
				} else {
					var numCategory = categoryLinks[categoryTitle];
					numCategory.items.push(dataItem);
					numCategory.count++;
				}
			}
			categories.sort(function(a, b) {
				if(a.count < b.count)
					return -1;
				if(a.count > b.count)
					return 1;
				return 0;
			});
			for (var i = 0, len = categories.length; i < len; i++) {
				var category = categories[i];
				if(i < maxType)
					lastOne = types[i];
				mapToAll(category.items, columnKey, lastOne);
			}
			return categories;
		}

		for(var ruleKey in this.parseRulesDataColumns) {
			var dataColumnKey = this.parseRulesDataColumns[ruleKey];
			var rule = this.parseRules[dataColumnKey];
			switch(rule.type){
				case PARSE_RULES_TYPES.NUMERIC:
					normaliseNumeric(this.parsedData, dataColumnKey, this.options.stepsCount, this.options.stepsCountKoeff);
				break;
				case PARSE_RULES_TYPES.COLOR:
					normaliseColor(this.parsedData, dataColumnKey, this.options.palette);
				break;
				case PARSE_RULES_TYPES.FIGURE:
					normaliseRange(this.parsedData, dataColumnKey, [THREEx.PLOT_TYPE.ITEM.SPHERE, THREEx.PLOT_TYPE.ITEM.CUBE]);
				break;
				case PARSE_RULES_TYPES.MATERIAL:
					normaliseRange(this.parsedData, dataColumnKey, [THREEx.PLOT_TYPE.MATERIAL.LAMBER, THREEx.PLOT_TYPE.MATERIAL.PHONG, THREEx.PLOT_TYPE.MATERIAL.BASIC]);
				break;
				case PARSE_RULES_TYPES.CONST:
				default:
					/* Const fields are never normalised */
				break;
			}
		}
	}

	this.parseData = function(data) {
		this.sourceData = data;
		this.rawParsedData = [];
		this.parsedData = [];

		for(var i = 0, len = data.length; i < len; i++){
			var sourceDataItem = this.sourceData[i];
			var parsedDataItem = {dataItem : sourceDataItem};
			for(var ruleKey in this.parseRules) {
				var rule = this.parseRules[ruleKey];
				parsedDataItem[ruleKey] = rule.func(sourceDataItem);
			}
			this.rawParsedData.push(parsedDataItem);
			this.parsedData.push(parsedDataItem);
		}
		if(this.options.stratch){
			this.normaliseParsedData(this.parsedData);
		}
	}

	this.onItemLoad = [];
	this.onItemsLoaded = [];
	this.onBeforeLoad = [];
	this.onPlotHover = [];
	this.onPlotHoverOut = [];
};

THREEx.ClusterPlot3d.prototype.doDrawBackground = function(elemId) {
	this.background(elemId);
	return this;
};

THREEx.ClusterPlot3d.prototype.doDrawData = function(){
	this.drawPlot();
	return this;
};

THREEx.ClusterPlot3d.prototype.doClear = function(){
	this.clearPlot();
	return this;
};

THREEx.ClusterPlot3d.prototype.doParseData = function(data, dataParseConfig) {
	this.prepareParseRules(dataParseConfig);
	this.parseData(data);
	return this
};

THREEx.ClusterPlot3d.prototype.execEvent = function(eventTitle, e){
	var i = this[eventTitle].length;
	while(i--){
		var func = this[eventTitle][i]
		if(typeof func == 'function')
			func(this, e);
	}
	return this;
};

THREEx.ClusterPlot3d.prototype.addEvent = function(eventTitle, func){
	if(typeof func != 'function')
		return this;

	if(this[eventTitle] === undefined){
		console.error("Plot 3D doesn't support event '%s'.", eventTitle);
		return this;
	}

	this[eventTitle].push(func);
	return this;
};

THREEx.getClusterPlotById = function(plotId) {
	if(THREEx._plots3d === undefined)
		return null;
	var plotIndex = THREEx._plots3d.length;
	while(plotIndex--){
		var plotItem = THREEx._plots3d[plotIndex];
		if(plotIndex.id !== undefined && plotIndex.id == plotId)
			return plotItem;
	}
	return null;
};

THREEx.doPlot3d = function(containerId, data, dataOptions, plotOptions, onItemLoad, onItemsLoad, onBeforeLoad, onPlotHover, onPlotHoverOut){
	var cluster3d = new THREEx.ClusterPlot3d(plotOptions)
		.addEvent('onItemLoad', onItemLoad)
		.addEvent('onItemsLoaded', onItemsLoad)
		.addEvent('onBeforeLoad', onBeforeLoad)
		.addEvent('onPlotHover', onPlotHover)
		.addEvent('onPlotHoverOut', onPlotHoverOut)
		.doDrawBackground(containerId)
		.doParseData(data, dataOptions)
		.doDrawData();

	return cluster3d;
};