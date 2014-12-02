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
if(typeof THREEx._plots3d == 'undefined') {
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

THREEx.CONST_ITEMS_MODE =
	{
		GEOMETRY : 0,
		PARTICLE : 1
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
		colorXZCentral : 0x0000ff,
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
		selectedItemColor : 0xFFFFFF,
		hintColor : 0xFFFF00,
		hintColorBorder : 0x000000,

		itemViewMode : THREEx.CONST_ITEMS_MODE.GEOMETRY,

		axisLabels : {
			x : 'x',
			y : 'y',
			z : 'z'
		}
	};

	this.options = {};

	if(typeof plotOptions != 'undefined'){
		for(var opt_key in defaultPlotOptions)
			this.options[opt_key] = (typeof plotOptions[opt_key] != 'undefined') ? plotOptions[opt_key] : defaultPlotOptions[opt_key];
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
				var intersects_raw = ray.intersectObjects( this.scene.children, true );
				var intersects = [];

				for(var i = 0, l = intersects_raw.length; i < l; i++){
					if(intersects_raw[i].object.name)
						intersects.push(intersects_raw[i]);
				}

				// this.intersected = the object in the scene currently closest to the camera 
				//		and this.intersected by the Ray projected from the mouse position 	
				// if there is one (or more) intersections
				if ( intersects.length )
				{
					var inter_index = 0;
					for(var inter_index = 0, intersects_length = intersects.length; inter_index < intersects_length; inter_index++){
						var intersect_obj = intersects[inter_index].object;
						if ( intersect_obj != this.intersected && intersect_obj.name ) 
						{
							if (this.intersected && typeof this.intersected.currentHex != 'undefined' && this.intersected.currentHex){
								this.intersected.material.color.setHex( this.intersected.currentHex );
							}
							
							// store reference to closest object as current intersection object
							this.intersected = intersect_obj;
							if(this.options.highlightSelected) {
								// store color of closest object (for later restoration)
								this.intersected.currentHex = this.intersected.material.color.getHex();
								// set a new color for closest object
								this.intersected.material.color.setHex( this.options.selectedItemColor );
							}
							this.execEvent('onHover', { mash_item : this.intersected, item : this.intersected ? this.intersected.itemData : null, mouse : this.mouse });
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
						this.execEvent('onHoverOut', { mash_item : this.intersected, item : this.intersected.itemData, mouse : this.mouse });
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

	this.grid_options = {
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

	this.grids = function() {
		var halfPI = Math.PI/2;

		var gridXZ = new THREE.GridHelper(this.grid_options.xz.size, this.grid_options.xz.step);
		gridXZ.setColors( new THREE.Color(this.options.colorXZCentral), new THREE.Color(this.options.colorXZ) );
		gridXZ.position.set( this.options.stepsSize, 0, this.options.stepsSize );
		this.scene.add(gridXZ);
			
		var gridXY = new THREE.GridHelper(this.grid_options.xy.size, this.grid_options.xy.step);
		gridXY.position.set( this.options.stepsSize, this.options.stepsSize, 0 );
		gridXY.rotation.x = halfPI;
		gridXY.setColors( new THREE.Color(this.options.colorXZCentral), new THREE.Color(this.options.colorXY) );
		this.scene.add(gridXY);

		var gridYZ = new THREE.GridHelper(this.grid_options.yz.size, this.grid_options.yz.step);
		gridYZ.position.set( 0, this.options.stepsSize, this.options.stepsSize );
		gridYZ.rotation.z = halfPI;
		gridYZ.setColors( new THREE.Color(this.options.colorYZCentral), new THREE.Color(this.options.colorYZ) );
		this.scene.add(gridYZ);

		this.gridXZ = gridXZ;
		this.gridXY = gridXY;
		this.gridYZ = gridYZ;
	}

	function getGeometry(item_type, size, position){
		function getSphereGeometry(radius){
			return new THREE.SphereGeometry( radius, THREEx.CONST_GEO.SPHERE.SEGMENTS.WIDTH, THREEx.CONST_GEO.SPHERE.SEGMENTS.HEIGHT);
		}
		function getCubeGeometry(radius){
			return new THREE.BoxGeometry(radius, radius, radius);
		}
		function getBarGeometry(radius, position){
			return new THREE.BoxGeometry(radius, position.z - radius / 2, radius);
		}

		switch(item_type)
		{
			case THREEx.PLOT_TYPE.ITEM.SPHERE : return getSphereGeometry(size);
			case THREEx.PLOT_TYPE.ITEM.CUBE   : return getCubeGeometry(size * 2);
			case THREEx.PLOT_TYPE.ITEM.BAR    : return getBarGeometry(size, position);
		}

		return null;
	}

	function getMaterial(item_material, item_color){
		function getBasicMaterial(properties){
			return new THREE.MeshBasicMaterial(properties);
		}

		function getLambertMaterial(properties){
			return new THREE.MeshLambertMaterial(properties);
		}

		function getPhongMaterial(properties) {
			return new THREE.MeshPhongMaterial(properties);
		}

		switch(item_material)
		{
			case THREEx.PLOT_TYPE.MATERIAL.BASIC  : return getBasicMaterial( { color: item_color } );
			case THREEx.PLOT_TYPE.MATERIAL.LAMBER : return getLambertMaterial( { color: item_color } );
			case THREEx.PLOT_TYPE.MATERIAL.PHONG  : return getPhongMaterial( { color: item_color } );
		}
		return null;
	}
	
	this.clear_plot = function(){
		while(this.parsedData.length) {
			var itemData = this.parsedData.pop();
			if(itemData.mesh)
				this.scene.remove(itemData.mesh);
			if(itemData.outlineMesh)
				this.scene.remove(itemData.outlineMesh);
		}
	}

	this.draw_plot = function() {
		function draw_plot_material(plot, parsedData) {
			var itemData_index = parsedData.length;

			while(itemData_index--) {
				var itemData = parsedData[itemData_index];

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

				switch(itemData.type)
				{
					case THREEx.PLOT_TYPE.ITEM.BAR:
						mesh.position.set(pos.x, (pos.y - itemData.size / 2) / 2, pos.z);
						break;
					default:
						mesh.position.set(pos.x, pos.y, pos.z);
					break;
				}

				itemData.mesh = mesh;
				plot.scene.add(mesh);

				if(itemData.outline_color && itemData.outline_expand) {
					var outlineMaterial = new THREE.MeshBasicMaterial( { color: itemData.outline_color, side: THREE.BackSide } );
					var outlineMesh = new THREE.Mesh( geometry, outlineMaterial );
					outlineMesh.position.x = mesh.position.x;
					outlineMesh.position.y = mesh.position.y;
					outlineMesh.position.z = mesh.position.z;
					outlineMesh.scale.multiplyScalar(itemData.outline_expand);
					itemData.outlineMesh = outlineMesh;
					plot.scene.add( outlineMesh );
				} else {
					itemData.outlineMesh = null;
				}
				plot.execEvent('onItemLoad', { item : itemData });
			}
		}

		function draw_plot_particle(plot, parsedData) {
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

			function getParticleMaterial(particle_classes, itemData) {
				var index = particle_classes.length;
				while(index--){
					var particle_class = particle_classes[index];
					if(cmpParticleMaterials(particle_class, itemData))
						return particle_class;
				}
				var new_material = createParticleMaterial(itemData);
				particle_classes.push(new_material);
				return new_material;
			}

			function do_show_patricles(plot, particle_groups){
				for(var i = 0, li = particle_groups.length; i < li; i++) {
					var particle_group = particle_groups[i];
					var geometry = new THREE.Geometry();
					var material = new THREE.PointCloudMaterial({
						size : particle_group.size,
						color : particle_group.color,
						vertexColors : false
					});
					
					for(var j = 0, lj = particle_group.items.length; j < lj; j++) {
						var particle_group_data = particle_group.items[j];
						var particle = new THREE.Vector3(
								particle_group_data.x,
								particle_group_data.y,
								particle_group_data.z
							);
						geometry.vertices.push(particle);
						plot.execEvent('onItemLoad', { item : particle });
					}
					var system = new THREE.PointCloud(geometry, material);
					plot.scene.add(system);
				}
			}

			var itemData_index = parsedData.length;
			var particle_groups = [];

			while(itemData_index--) {
				var itemData = parsedData[itemData_index];
				var itemData_material = getParticleMaterial(particle_groups, itemData);
				itemData_material.items.push(itemData);
			}

			do_show_patricles(plot, particle_groups);
		}

		var drawing_func = null;
		switch(this.options.itemViewMode)
		{
			case THREEx.CONST_ITEMS_MODE.GEOMETRY:
				 drawing_func = draw_plot_material;
			break;
			case THREEx.CONST_ITEMS_MODE.PARTICLE:
				drawing_func = draw_plot_particle;
			break;
		}
		drawing_func(this, this.parsedData);
		this.execEvent('onItemsLoaded', { items : this.parsedData });
	}

	var PARSE_RULES_TYPES = {
		CONST : 0,
		NUMERIC : 1,
		COLOR : 2,
		FIGURE : 3,
		MATERIAL : 4
	};

	function makeParseRule(type, is_normalised){
		return { type : type, func : null, is_normalised : is_normalised}
	}

	this.parse_rules = {
			x : makeParseRule(PARSE_RULES_TYPES.NUMERIC, true),
			y : makeParseRule(PARSE_RULES_TYPES.NUMERIC, true),
			z : makeParseRule(PARSE_RULES_TYPES.NUMERIC, true),
			title : makeParseRule(PARSE_RULES_TYPES.CONST, false),
			color : makeParseRule(PARSE_RULES_TYPES.COLOR, false),
			outline_color : makeParseRule(PARSE_RULES_TYPES.COLOR, false),
			outline_expand : makeParseRule(PARSE_RULES_TYPES.NUMERIC, false),
			material : makeParseRule(PARSE_RULES_TYPES.MATERIAL, false),
			size : makeParseRule(PARSE_RULES_TYPES.NUMERIC, false),
			type : makeParseRule(PARSE_RULES_TYPES.FIGURE, false)
		};

	this.parse_rules_data_columns = [];

	this.prepare_parse_rules = function(rules) {
		var default_rules_values = {
			title : null,
			x : 0,
			y : 0,
			z : 0,
			color : 0xFF0000,
			outline_color : null,
			outline_expand : 1.2,
			material : THREEx.PLOT_TYPE.MATERIAL.LAMBER,
			size : 1,
			type : THREEx.PLOT_TYPE.ITEM.CUBE
		};

		var ignored_values = [];

		var default_rules = {
			title : function(item){ 
					var item_str = '';
					for(var key in item) {
						if(ignored_values.indexOf(key) > 0)
							continue;
						var item_val = item[key];
						if(typeof item_val == 'underfined')
							continue;
						item_str += key + ' : ' + (item_val != null ? item_val : 'null' ) + '\n';
					}
					return item_str;
				},
			x : function(item) { return (typeof item[0] != 'undefined') ? item[0] : default_rules_values.x; },
			y : function(item) { return (typeof item[1] != 'undefined') ? item[1] : default_rules_values.y; },
			z : function(item) { return (typeof item[2] != 'undefined') ? item[2] : default_rules_values.z; },
			size : function(item) { return (typeof item[3] != 'undefined') ? item[3] : default_rules_values.size; },
			color : function() { return default_rules_values.color; },
			outline_color : function() { return default_rules_values.outline_color; },
			outline_expand : function() { return default_rules_values.outline_expand; },
			material : function() { return default_rules_values.material; },
			type : function() { return default_rules_values.type; }
		};

		function get_rule_value(rule_key, is_normalised) {
			if(typeof rules[rule_key] != 'undefined'){
				if(typeof rules[rule_key] == 'function')
					return { func: rules[rule_key], is_changed : true };
				return { func: function(item) { return item[rules[rule_key]]; }, is_changed : true };
			}
			var rule_key_const = rule_key + '_const';
			if(typeof rules[rule_key_const] != 'undefined')
				return { func : function() { return rules[rule_key_const] }, is_changed : false };
			if(typeof default_rules[rule_key] != 'undefined')
				return { func : default_rules[rule_key], is_changed : is_normalised };
			return null;
		}

		for(var rule_key in default_rules) {
			var rule_value = get_rule_value(rule_key, this.parse_rules[rule_key].is_normalised);
			this.parse_rules[rule_key].func = rule_value.func;
			if(rule_value.is_changed)
				this.parse_rules_data_columns.push(rule_key);
		}
	}

	this.background = function(elem_id){
		this.execEvent('onBeforeLoad', { items : this.parsedData });
		this.id = elem_id;
		this.element_id = elem_id;
		this.container = document.getElementById(elem_id);
		if(!this.container){
			console.error("Element with id '%s' is not found.", elem_id);
			return null;
		}
		
		this.init();
		if(this.options.showGrids){
			this.grids();
		}
		this.animate();

		return this.scene;
	}

	this.normalise_parsedData = function(){
		function map_to_all(items, col_key, val) {
			var i = items.length;
			while(i--)
				items[i][col_key] = val;
		}

		function normalise_numeric(data_to_normalise, key, stepsCount, stepsCountKoeff) {
			var maxValue = Number.NEGATIVE_INFINITY;
			var minValue = Number.POSITIVE_INFINITY;
			var data_length = data_to_normalise.length;
			var data_key = data_length;
			while(data_key--) {
				var data_item = data_to_normalise[data_key][key];
				maxValue = Math.max(data_item, maxValue);
				minValue = Math.min(data_item, minValue);
			}

			var koeff = ((maxValue != minValue) ? (stepsCount / (maxValue - minValue)) : stepsCount) * stepsCountKoeff;
			data_key = data_length;
			while(data_key--) {
				var data_item = data_to_normalise[data_key][key];
				data_item = ((maxValue != minValue) ? (data_item - minValue) : data_item) * koeff;
				data_to_normalise[data_key][key] = data_item;
			}
		}

		function normalise_color(data_to_normalise, column_key, palette) {
			var categories = [];
			for(var item_key in data_to_normalise){
				var item_value = data_to_normalise[item_key][column_key];
				if(categories.indexOf(item_value) < 0)
					categories.push(item_value);
			}

			var colors = THREEx.getColorsRange(categories.length);

			for(var item_key in data_to_normalise){
				var item = data_to_normalise[item_key];
				item[column_key] = colors[categories.indexOf(item[column_key])];				
			}
		}

		function normalise_range(data, col_key, types) {
			var max_type = types.length,
				is_overflown = false,
				category_links = {},
				categories = [],
				last_one = null;

			for(var data_key in data) {
				var data_item = data[data_key];
				var category_title = data_item[col_key];
				if(typeof category_links[category_title] == 'undefined') {
					var num_category =
					{
						name : category_title,
						items : [data_item],
						count : 1
					};
					category_links[category_title] = num_category;
					categories.push(num_category);
					if(!is_overflown && categories.length > max_type){
						is_overflown = true;
						console.warn("There're more variants then categories in column '%s'", col_key);
					}
				} else {
					var num_category = category_links[category_title];
					num_category.items.push(data_item);
					num_category.count++;
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
				if(i < max_type)
					last_one = types[i];
				map_to_all(category.items, col_key, last_one);
			}
			return categories;
		}

		for(var rule_key in this.parse_rules_data_columns) {
			var data_column_key = this.parse_rules_data_columns[rule_key];
			var rule = this.parse_rules[data_column_key];
			switch(rule.type){
				case PARSE_RULES_TYPES.NUMERIC:
					normalise_numeric(this.parsedData, data_column_key, this.options.stepsCount, this.options.stepsCountKoeff);
				break;
				case PARSE_RULES_TYPES.COLOR:
					normalise_color(this.parsedData, data_column_key, this.options.palette);
				break;
				case PARSE_RULES_TYPES.FIGURE:
					normalise_range(this.parsedData, data_column_key, [THREEx.PLOT_TYPE.ITEM.SPHERE, THREEx.PLOT_TYPE.ITEM.CUBE]);
				break;
				case PARSE_RULES_TYPES.MATERIAL:
					normalise_range(this.parsedData, data_column_key, [THREEx.PLOT_TYPE.MATERIAL.LAMBER, THREEx.PLOT_TYPE.MATERIAL.PHONG, THREEx.PLOT_TYPE.MATERIAL.BASIC]);
				break;
				case PARSE_RULES_TYPES.CONST:
				default:
					/* Const fields are never normalised */
				break;
			}
		}
	}

	this.parse_data = function(data) {
		this.source_data = data;
		this.raw_parsedData = [];
		this.parsedData = [];

		for(var i = 0, len = data.length; i < len; i++){
			var source_data_item = this.source_data[i];
			var parsedData_item = {data_item : source_data_item};
			for(var rule_key in this.parse_rules) {
				var rule = this.parse_rules[rule_key];
				parsedData_item[rule_key] = rule.func(source_data_item);
			}
			this.raw_parsedData.push(parsedData_item);
			this.parsedData.push(parsedData_item);
		}
		if(this.options.stratch){
			this.normalise_parsedData(this.parsedData);
		}
	}

	this.onItemLoad = [];
	this.onItemsLoaded = [];
	this.onBeforeLoad = [];
	this.onHover = [];
	this.onHoverOut = [];
};

THREEx.ClusterPlot3d.prototype.doDrawBackground = function(elem_id) {
	this.background(elem_id);
	return this;
};

THREEx.ClusterPlot3d.prototype.doDrawData = function(){
	this.draw_plot();
	return this;
};

THREEx.ClusterPlot3d.prototype.doClear = function(){
	this.clear_plot();
	return this;
};

THREEx.ClusterPlot3d.prototype.doParseData = function(data, data_parse_config) {
	this.prepare_parse_rules(data_parse_config);
	this.parse_data(data);
	return this
};

THREEx.ClusterPlot3d.prototype.execEvent = function(event_title, e){
	var i = this[event_title].length;
	while(i--){
		var func = this[event_title][i]
		if(typeof func == 'function')
			func(this, e);
	}
	return this;
};

THREEx.ClusterPlot3d.prototype.addEvent = function(event_title, func){
	if(typeof func != 'function')
		return this;

	if(typeof this[event_title] == 'undefined'){
		console.error("Plot 3D doesn't support event '%s'.", event_title);
		return this;
	}

	this[event_title].push(func);
	return this;
};

THREEx.getClusterPlotById = function(plot_id) {
	if(typeof THREEx._plots3d == 'undefined')
		return null;
	var plot_index = THREEx._plots3d.length;
	while(plot_index--){
		var plot_item = THREEx._plots3d[plot_index];
		if(typeof plot_index.id != 'undefined' && plot_index.id == plot_id)
			return plot_index;
	}
	return null;
};

THREEx.doPlot3d = function(container_id, data, data_options, plotOptions, on_item_load, on_items_load, on_before_load, on_hover, on_hover_out){
	var cluster3d = new THREEx.ClusterPlot3d(plotOptions)
		.addEvent('onItemLoad', on_item_load)
		.addEvent('onItemsLoaded', on_items_load)
		.addEvent('onBeforeLoad', on_before_load)
		.addEvent('onHover', on_hover)
		.addEvent('onHoverOut', on_hover_out)
		.doDrawBackground(container_id)
		.doParseData(data, data_options)
		.doDrawData();

	return cluster3d;
};