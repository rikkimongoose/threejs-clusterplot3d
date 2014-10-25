

/** @namespace */
var THREEx	= THREEx 		|| {};

var ThreeJs_plots = [];

THREEx.ClusterPlot3d = function(plot_options)
{
	this.keyboard = new THREEx.KeyboardState();
	this.clock = new THREE.Clock();

	this.options = plot_options || {};
	this.options.show_stats = false;

	if(typeof THREEx._plots3d == "undefined")	{
		THREEx._plots3d = [];
	}

	THREEx._plots3d.push(this);

	var PLOT_TYPE =
		{
			ITEM :
			{
				SPHERE : 0,
				CUBE : 1,
				BAR : 2
			},
			MATERIAL :
			{
				BASIC : 0,
				LAMBER : 1,
				PHONG : 2
			}
		};


	var CONST_GEO =
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
			BAR :
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

	this.sceneConfig = {
			show_axes : true,
			scene_objects : [],
			lighting : {},
			camera : {},
			data : [
				{
					position : 
					{
						x : 0,
						y : 0,
						z : 0
					},
					color : 0x00ff00,
					outline : {
						mode : CONST_GEO.MODE.OUTLINE.YES,
						color : 0xff0000,
						expand : 1.2
					},
					size : 10,
					type : PLOT_TYPE.ITEM.CUBE,
					material : PLOT_TYPE.MATERIAL.PHONG,
					original_item : {}
				},
				{
					position : 
					{
						x : 40,
						y : 40,
						z : 40
					},
					color : 0x0000ff,
					outline : {
						mode : CONST_GEO.MODE.OUTLINE.YES,
						color : 0xff0000,
						expand : 1.2
					},
					size : 5,
					type : PLOT_TYPE.ITEM.BAR,
					material : PLOT_TYPE.MATERIAL.BASIC,
					original_item : {}
				},
				{
					position : 
					{
						x : 0,
						y : 40,
						z : 40
					},
					color : 0x0000ff,
					outline : {
						mode : CONST_GEO.MODE.OUTLINE.YES,
						color : 0xff0000,
						expand : 1.2
					},
					size : 8,
					type : PLOT_TYPE.ITEM.SPHERE,
					material : PLOT_TYPE.MATERIAL.LAMBER,
					original_item : {}
				}
			]
		};

	this.init = function(container) {
		this.scene = new THREE.Scene();
	
		// CAMERA
		var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
		var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
		this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
		this.scene.add(this.camera);
		this.camera.position.set(0,150,400);
		this.camera.lookAt(this.scene.position);	
		
		// RENDERER
		if ( Detector.webgl )
			this.renderer = new THREE.WebGLRenderer( {antialias:true} );
		else
			this.renderer = new THREE.CanvasRenderer(); 
		this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

		this.container.appendChild( this.renderer.domElement );

		// EVENTS
		THREEx.WindowResize(this.renderer, this.camera);
		THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

		// CONTROLS
		this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
		
		if(this.options.show_stats){
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
		var light = new THREE.PointLight(0xffffff);
		light.position.set(100,250,100);
		this.scene.add(light);
		
		// SKYBOX
		var skyBoxGeometry = new THREE.BoxGeometry( 10000, 10000, 10000 );
		var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
		var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
		this.scene.add(skyBox);
	}

	this.animate = function() {
    	requestAnimationFrame(this.animate.bind(this));
		this.render();		
		this.update();
	}
	this.update = function(){
		if ( this.keyboard.pressed("z") ) 
		{	// do something   
		}	
		this.controls.update();
		if(this.stats)
			this.stats.update();
	}

	this.render = function() {
		this.renderer.render( this.scene, this.camera );
	}

	this.grids = function(){
		var gridXZ = new THREE.GridHelper(100, 10);
		gridXZ.setColors( new THREE.Color(0x006600), new THREE.Color(0x006600) );
		gridXZ.position.set( 100,0,100 );
		this.scene.add(gridXZ);
			
		var gridXY = new THREE.GridHelper(100, 10);
		gridXY.position.set( 100,100,0 );
		gridXY.rotation.x = Math.PI/2;
		gridXY.setColors( new THREE.Color(0x000066), new THREE.Color(0x000066) );
		this.scene.add(gridXY);

		var gridYZ = new THREE.GridHelper(100, 10);
		gridYZ.position.set( 0,100,100 );
		gridYZ.rotation.z = Math.PI/2;
		gridYZ.setColors( new THREE.Color(0x660000), new THREE.Color(0x660000) );
		this.scene.add(gridYZ);
	}

	this.getGeometry = function(item_type, size, position){
		var getSphereGeometry = function(radius){
			return new THREE.SphereGeometry( radius, CONST_GEO.SPHERE.SEGMENTS.WIDTH, CONST_GEO.SPHERE.SEGMENTS.HEIGHT);
		}
		var getCubeGeometry = function(radius){
			return new THREE.BoxGeometry(radius, radius, radius);
		}
		var getBarGeometry = function(radius, position){
			return new THREE.BoxGeometry(radius, position.z - radius / 2, radius);
		}

		if(item_type == PLOT_TYPE.ITEM.SPHERE)
			return getSphereGeometry(size / 2);
		else if(item_type == PLOT_TYPE.ITEM.CUBE)
			return getCubeGeometry(size);
		else if(item_type == PLOT_TYPE.ITEM.BAR)
			return getBarGeometry(size, position);

		return null;
	}


	this.getMaterial = function(item_material, item_color){
		var getBasicMaterial = function(properties){
			return new THREE.MeshBasicMaterial(properties);
		}

		var getLambertMaterial = function(properties){
			return new THREE.MeshLambertMaterial(properties);
		}

		var getPhongMaterial = function(properties) {
			return new THREE.MeshPhongMaterial(properties);
		}

		if(item_material == PLOT_TYPE.MATERIAL.BASIC)
			return getBasicMaterial( { color: item_color } );
		else if(item_material == PLOT_TYPE.MATERIAL.LAMBER)
			return getLambertMaterial( { color: item_color } );
		else if(item_material == PLOT_TYPE.MATERIAL.PHONG)
			return getPhongMaterial( { color: item_color } );

		return null;
	}
	
	this.drawData = function() {
		var itemDataIndex = this.sceneConfig.data.length;
		while(itemDataIndex--) {
			var itemData = this.sceneConfig.data[itemDataIndex];
			var geometry = this.getGeometry(itemData.type, itemData.size, itemData.position);
			var material = this.getMaterial(itemData.material, itemData.color);
			var mesh = new THREE.Mesh( geometry, material );

			if(itemData.type == PLOT_TYPE.ITEM.BAR)
				mesh.position.set(itemData.position.x,( itemData.position.y  - itemData.size / 2) / 2, itemData.position.z);
			else
				mesh.position.set(itemData.position.x, itemData.position.y, itemData.position.z);
			this.scene.add(mesh);

			if(itemData.outline.mode == CONST_GEO.MODE.OUTLINE.YES) {
				var outlineMaterial = new THREE.MeshBasicMaterial( { color: itemData.outline.color, side: THREE.BackSide } );
				var outlineMesh = new THREE.Mesh( geometry, outlineMaterial );
				outlineMesh.position.x = mesh.position.x;
				outlineMesh.position.y = mesh.position.y;
				outlineMesh.position.z = mesh.position.z;
				outlineMesh.scale.multiplyScalar(itemData.outline.expand);
				this.scene.add( outlineMesh );
			}
		}
	}
}

THREEx.ClusterPlot3d.prototype.doDrawBackground = function(elem_id)
{
	this.id = elem_id;
	this.element_id = elem_id;
	this.container = document.getElementById(elem_id);
	if(!this.container){
		console.error("Element with id '%s' is not found.", elem_id);
		return null;
	}
	
	this.init();
	this.grids(this.scene);
	this.animate();
	return this.scene;
}
THREEx.ClusterPlot3d.prototype.doDrawData = function(){
	this.drawData();
}