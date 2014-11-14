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
if(typeof THREEx._plots3d == "undefined") {
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

THREEx.ORIENTATION = {
	DEFAULT : 0,
	RUSSIAN : 1
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

THREEx.ClusterPlot3d = function(plot_options) {
	this.keyboard = new THREEx.KeyboardState();
	this.clock = new THREE.Clock
	this.projector = new THREE.Projector();
	
	var default_plot_options = {
		show_stats : false,
		stratch : true,
		show_grids : true,
		grids_orientation : THREEx.ORIENTATION.DEFAULT,

		color_bg_box : 0xffffff,
		color_light : 0xffffff,

		color_xz : 0x006600,
		color_xz_central : 0x00ff00,
		color_xy : 0x000066,
		color_xy_central : 0x0000ff,
		color_yz : 0x660000,
		color_yz_central : 0xff0000,

		camera_x : 400,
		camera_y : 300,
		camera_z : 400,
		camera_angle : 45,

		light_x : 400,
		light_y : 300,
		light_z : 400,

		steps_size : 100,
		steps_count : 20,
		palette : THREEx.COLOR_PALETTE_TYPE.HSL,

		show_skybox : true,
		highlight_selected : true,
		show_hint : true,
		selected_item_color : 0xFFFFFF,
		hint_color : 0xFFFF00,
		hint_color_border : 0x000000,

		unite_items : true,
		eps : 0.01
	};

	this.options = {};

	if(typeof plot_options != "undefined"){
		for(var opt_key in default_plot_options)
			this.options[opt_key] = (typeof plot_options[opt_key] != "undefined") ? plot_options[opt_key] : default_plot_options[opt_key];
	} else {
		for(var opt_key in default_plot_options)
			this.options[opt_key] = default_plot_options[opt_key];
	}

	this.options.steps_step = (this.options.steps_size / this.options.steps_count) * 2;
	this.options.steps_count_koeff = this.options.steps_step;

	this.intersecred = null;
	this.hint_sprite = null;
	this.mouse = null;
    
	THREEx._plots3d.push(this);
	
	this.onDocumentMouseMove = function( event ) 
	{
		// the following line would stop any other event handler from firing
		// (such as the mouse's TrackballControls)
		// event.preventDefault();

		// update sprite position
		if(this.show_hint && this.hint_sprite) {
			this.hint_sprite.position.set( event.clientX, event.clientY - 20, 0 );
		}
		//console.log(event.clientX + 'x' + event.clientY);
		// update the mouse variable
		this.mouse = {
			x : ( event.clientX / this.renderer.domElement.clientWidth )  * 2 - 1,
			y : -( event.clientY / this.renderer.domElement.clientHeight ) * 2 + 1
		};
	};

	this.init = function() {
		/*function load_sprite_alignment() {
			THREE.SpriteAlignment = {};
			THREE.SpriteAlignment.topLeft = new THREE.Vector2( 1, -1 );
			THREE.SpriteAlignment.topCenter = new THREE.Vector2( 0, -1 );
			THREE.SpriteAlignment.topRight = new THREE.Vector2( -1, -1 );
			THREE.SpriteAlignment.centerLeft = new THREE.Vector2( 1, 0 );
			THREE.SpriteAlignment.center = new THREE.Vector2( 0, 0 );
			THREE.SpriteAlignment.centerRight = new THREE.Vector2( -1, 0 );
			THREE.SpriteAlignment.bottomLeft = new THREE.Vector2( 1, 1 );
			THREE.SpriteAlignment.bottomCenter = new THREE.Vector2( 0, 1 );
			THREE.SpriteAlignment.bottomRight = new THREE.Vector2( -1, 1 );
		}
		if(typeof THREE.SpriteAlignment == "undefined"){
			load_sprite_alignment();
		}*/
		this.scene = new THREE.Scene();
		// CAMERA
		var screen_width = this.container.clientWidth, screen_height = this.container.clientHeight;
		var VIEW_ANGLE = this.options.camera_angle, ASPECT = screen_width / screen_height, NEAR = 0.1, FAR = 20000;
		this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
		this.scene.add(this.camera);
		this.camera.position.set(this.options.camera_x, this.options.camera_y, this.options.camera_z);
		this.camera.lookAt(this.scene.position);	
		
		// RENDERER
		if ( Detector.webgl )
			this.renderer = new THREE.WebGLRenderer( {antialias:true} );
		else
			this.renderer = new THREE.CanvasRenderer(); 
		this.renderer.setSize(screen_width, screen_height);

		this.container.appendChild( this.renderer.domElement );

		this.container.addEventListener( 'mousemove', this.onDocumentMouseMove.bind(this), false );
		
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
		this.options.light_x = this.options.steps_size * 4;
		this.options.light_y = this.options.steps_size * 3;
		this.options.light_z = this.options.steps_size * 4;

		var light = new THREE.PointLight(this.options.color_light);
		light.position.set(this.options.light_x, this.options.light_y, this.options.light_z);
		this.scene.add(light);


		var light2 = new THREE.PointLight(this.options.color_light);
		light2.position.set(0, 0, 0);
		this.scene.add(light2);

		this.intersected = null;

		// SKYBOX
		if(this.options.show_skybox) {
			var skyBoxGeometry = new THREE.BoxGeometry( 10000, 10000, 10000 );
			var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: this.options.color_bg_box, side: THREE.BackSide } );
			var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
			skyBox.name=null;
			this.scene.add(skyBox);
		}
	}

	this.animate = function() {
    	requestAnimationFrame(this.animate.bind(this));
		this.render();
		this.update();
		//this.
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
					while(inter_index < intersects.length){
						var intersect_obj = intersects[inter_index].object;
						if ( intersect_obj != this.intersected && intersect_obj.name ) 
						{
							if (this.intersected && typeof this.intersected.currentHex != "undefined" && this.intersected.currentHex){
								this.intersected.material.color.setHex( this.intersected.currentHex );
							}
							
							// store reference to closest object as current intersection object
							this.intersected = intersect_obj;
							if(this.options.highlight_selected) {
								// store color of closest object (for later restoration)
								this.intersected.currentHex = this.intersected.material.color.getHex();
								// set a new color for closest object
								this.intersected.material.color.setHex( this.options.selected_item_color );
							}
							this.execEvent("onHover", { mash_item : this.intersected, item : this.intersected ? this.intersected.item_data : null, mouse : this.mouse });

							break;	
						}
						inter_index++;
					}
				} 
				else // there are no intersections
				{
					// restore previous intersection object (if it exists) to its original color
					// remove previous intersection object reference
					//     by setting current intersection object to "nothing"

					if ( this.intersected ) {
						this.intersected.material.color.setHex( this.intersected.currentHex );
						this.execEvent("onHoverOut", { mash_item : this.intersected, item : this.intersected.item_data, mouse : this.mouse });
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
			size : this.options.steps_size,
			step : this.options.steps_step
		},
		xy : {
			size : this.options.steps_size,
			step : this.options.steps_step
		},
		yz : {
			size : this.options.steps_size,
			step : this.options.steps_step
		}
	};

	this.grids = function(){
		var gridXZ = new THREE.GridHelper(this.grid_options.xz.size, this.grid_options.xz.step);
		gridXZ.setColors( new THREE.Color(this.options.color_xz_central), new THREE.Color(this.options.color_xz) );
		gridXZ.position.set( this.options.steps_size, 0, this.options.steps_size );
		this.scene.add(gridXZ);
			
		var gridXY = new THREE.GridHelper(this.grid_options.xy.size, this.grid_options.xy.step);
		gridXY.position.set( this.options.steps_size, this.options.steps_size, 0 );
		gridXY.rotation.x = Math.PI/2;
		gridXY.setColors( new THREE.Color(this.options.color_xy_central), new THREE.Color(this.options.color_xy) );
		this.scene.add(gridXY);

		var gridYZ = new THREE.GridHelper(this.grid_options.yz.size, this.grid_options.yz.step);
		gridYZ.position.set( 0, this.options.steps_size, this.options.steps_size );
		gridYZ.rotation.z = Math.PI/2;
		gridYZ.setColors( new THREE.Color(this.options.color_yz_central), new THREE.Color(this.options.color_yz) );
		this.scene.add(gridYZ);

		switch(this.options.grids_orientation)
		{
			case THREEx.ORIENTATION.DEFAULT:
				this.gridXZ = gridXZ;
				this.gridXY = gridXY;
				this.gridYZ = gridYZ;
			break;
			case THREEx.ORIENTATION.RUSSIAN:
				this.gridXZ = gridXY;
				this.gridXY = gridYZ;
				this.gridYZ = gridYZ;
			break;
		}
	}

	this.getGeometry = function(item_type, size, position){
		function getSphereGeometry(radius){
			return new THREE.SphereGeometry( radius, THREEx.CONST_GEO.SPHERE.SEGMENTS.WIDTH, THREEx.CONST_GEO.SPHERE.SEGMENTS.HEIGHT);
		}
		function getCubeGeometry(radius){
			return new THREE.BoxGeometry(radius, radius, radius);
		}
		function getBarGeometry(radius, position){
			return new THREE.BoxGeometry(radius, position.z - radius / 2, radius);
		}

		if(item_type == THREEx.PLOT_TYPE.ITEM.SPHERE)
			return getSphereGeometry(size);
		else if(item_type == THREEx.PLOT_TYPE.ITEM.CUBE)
			return getCubeGeometry(size * 2);
		else if(item_type == THREEx.PLOT_TYPE.ITEM.BAR)
			return getBarGeometry(size, position);

		return null;
	}


	this.getMaterial = function(item_material, item_color){
		function getBasicMaterial(properties){
			return new THREE.MeshBasicMaterial(properties);
		}

		function getLambertMaterial(properties){
			return new THREE.MeshLambertMaterial(properties);
		}

		function getPhongMaterial(properties) {
			return new THREE.MeshPhongMaterial(properties);
		}

		if(item_material == THREEx.PLOT_TYPE.MATERIAL.BASIC)
			return getBasicMaterial( { color: item_color } );
		else if(item_material == THREEx.PLOT_TYPE.MATERIAL.LAMBER)
			return getLambertMaterial( { color: item_color } );
		else if(item_material == THREEx.PLOT_TYPE.MATERIAL.PHONG)
			return getPhongMaterial( { color: item_color } );

		return null;
	}
	
	this.clear_plot = function(){
		while(this.parsed_data.length) {
			var item_data = this.parsed_data.pop();
			if(item_data.mesh)
				this.scene.remove(item_data.mesh);
			if(item_data.outlineMesh)
				this.scene.remove(item_data.outlineMesh);
		}
	}

	this.draw_plot = function() {
		var item_data_index = this.parsed_data.length;
		var already_added_items = {
			items : [],
			push : function(mesh_data, item_data){
				items.push({
					x : item_data.x,
					y : item_data.y,
					z : item_data.z,
					size : item_data.size,
					mesh : mesh_data
				});
			},
			item_for : function(x, y, z, size, eps){
				function eps_comp(a1, a2, eps) {
					return Math.abs(a1 - a2) < eps;
				}
				for(var i = 0, l = items.length; i < l; i++){
					var item = this.items[i];
					if(eps_comp(item.x, x, eps) && eps_comp(item.y, y, eps) && eps_comp(item.z, z, eps))
						return item;
					//проверь size
				}
			}
			mesh_for : function(item_data, eps){

			}
		};

		while(item_data_index--) {
			var item_data = this.parsed_data[item_data_index];
			var geometry = this.getGeometry(item_data.type, item_data.size, item_data);
			var material = this.getMaterial(item_data.material, item_data.color);
			var mesh = new THREE.Mesh( geometry, material );
			mesh.name = item_data.title;
			mesh.item_data = item_data;

			var pos = {
				x : null,
				y : null,
				z : null
			};
			switch(this.options.grids_orientation)
			{
				case THREEx.ORIENTATION.DEFAULT:
					pos.x = item_data.x;
					pos.y = item_data.y;
					pos.z = item_data.z;
				break;
				case THREEx.ORIENTATION.RUSSIAN:
					pos.x = item_data.x;
					pos.y = item_data.z;
					pos.z = item_data.y;
				break;
			}

			if(item_data.type == THREEx.PLOT_TYPE.ITEM.BAR)
				mesh.position.set(pos.x,( pos.y - item_data.size / 2) / 2, pos.z);
			else
				mesh.position.set(pos.x, pos.y, pos.z);

			item_data.mesh = mesh;
			this.scene.add(mesh);

			if(item_data.outline_color && item_data.outline_expand) {
				var outlineMaterial = new THREE.MeshBasicMaterial( { color: item_data.outline_color, side: THREE.BackSide } );
				var outlineMesh = new THREE.Mesh( geometry, outlineMaterial );
				outlineMesh.position.x = mesh.position.x;
				outlineMesh.position.y = mesh.position.y;
				outlineMesh.position.z = mesh.position.z;
				outlineMesh.scale.multiplyScalar(item_data.outline_expand);
				item_data.outlineMesh = outlineMesh;
				this.scene.add( outlineMesh );
			} else {
				item_data.outlineMesh = null;
			}

			this.execEvent("onItemLoad", { item : item_data });
		}

		this.execEvent("onItemsLoaded", { items : this.parsed_data });
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
						if(typeof item_val == "underfined")
							continue;
						item_str += key + ' : ' + (item_val != null ? item_val : "null" ) + "\n"
					}
					return item_str;
				},
			x : function(item) { return (typeof item[0] != "undefined") ? item[0] : default_rules_values.x; },
			y : function(item) { return (typeof item[1] != "undefined") ? item[1] : default_rules_values.y; },
			z : function(item) { return (typeof item[2] != "undefined") ? item[2] : default_rules_values.z; },
			size : function(item) { return (typeof item[3] != "undefined") ? item[3] : default_rules_values.size; },
			color : function() { return default_rules_values.color; },
			outline_color : function() { return default_rules_values.outline_color; },
			outline_expand : function() { return default_rules_values.outline_expand; },
			material : function() { return default_rules_values.material; },
			type : function() { return default_rules_values.type; }
		};

		function get_rule_value(rule_key, is_normalised) {
			if(typeof rules[rule_key] != "undefined"){
				if(typeof rules[rule_key] == "function")
					return { func: rules[rule_key], is_changed : true };
				return { func: function(item) { return item[rules[rule_key]]; }, is_changed : true };
			}
			var rule_key_const = rule_key + "_const";
			if(typeof rules[rule_key_const] != "undefined")
				return { func : function() { return rules[rule_key_const] }, is_changed : false };
			if(typeof default_rules[rule_key] != "undefined")
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
		this.execEvent("onBeforeLoad", { items : this.parsed_data });
		this.id = elem_id;
		this.element_id = elem_id;
		this.container = document.getElementById(elem_id);
		if(!this.container){
			console.error("Element with id '%s' is not found.", elem_id);
			return null;
		}
		
		this.init();
		if(this.options.show_grids){
			this.grids();
		}
		this.animate();

		return this.scene;
	}

	this.normalise_parsed_data = function(){
		function map_to_all(items, col_key, val) {
			var i = items.length;
			while(i--)
				items[i][col_key] = val;
		}

		function normalise_numeric(data_to_normalise, key, steps_count, steps_count_koeff) {
			var maxValue = Number.NEGATIVE_INFINITY;
			var minValue = Number.POSITIVE_INFINITY;
			var data_length = data_to_normalise.length;
			var data_key = data_length;
			while(data_key--) {
				var data_item = data_to_normalise[data_key][key];
				maxValue = Math.max(data_item, maxValue);
				minValue = Math.min(data_item, minValue);
			}

			var koeff = ((maxValue != minValue) ? (steps_count / (maxValue - minValue)) : steps_count) * steps_count_koeff;
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
				if(typeof category_links[category_title] == "undefined") {
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
					normalise_numeric(this.parsed_data, data_column_key, this.options.steps_count, this.options.steps_count_koeff);
				break;
				case PARSE_RULES_TYPES.COLOR:
					normalise_color(this.parsed_data, data_column_key, this.options.palette);
				break;
				case PARSE_RULES_TYPES.FIGURE:
					normalise_range(this.parsed_data, data_column_key, [THREEx.PLOT_TYPE.ITEM.SPHERE, THREEx.PLOT_TYPE.ITEM.CUBE]);
				break;
				case PARSE_RULES_TYPES.MATERIAL:
					normalise_range(this.parsed_data, data_column_key, [THREEx.PLOT_TYPE.MATERIAL.LAMBER, THREEx.PLOT_TYPE.MATERIAL.PHONG, THREEx.PLOT_TYPE.MATERIAL.BASIC]);
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
		this.raw_parsed_data = [];
		this.parsed_data = [];

		for(var i = 0, len = data.length; i < len; i++){
			var source_data_item = this.source_data[i];
			var parsed_data_item = {data_item : source_data_item};
			for(var rule_key in this.parse_rules) {
				var rule = this.parse_rules[rule_key];
				parsed_data_item[rule_key] = rule.func(source_data_item);
			}
			this.raw_parsed_data.push(parsed_data_item);
			this.parsed_data.push(parsed_data_item);
		}
		if(this.options.stratch){
			this.normalise_parsed_data(this.parsed_data);
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
		if(typeof func == "function")
			func(this, e);
	}
	return this;
};

THREEx.ClusterPlot3d.prototype.addEvent = function(event_title, func){
	if(typeof func != "function")
		return this;

	if(typeof this[event_title] == "undefined"){
		console.error("Plot 3D doesn't support event '%s'.", event_title);
		return this;
	}

	this[event_title].push(func);
	return this;
};

THREEx.getClusterPlotById = function(plot_id) {
	if(typeof THREEx._plots3d == "undefined")
		return null;
	var plot_index = THREEx._plots3d.length;
	while(plot_index--){
		var plot_item = THREEx._plots3d[plot_index];
		if(typeof plot_index.id != "underfined" && plot_index.id == plot_id)
			return plot_index;
	}
	return null;
};

THREEx.doPlot3d = function(container_id, data, data_options, plot_options, on_item_load, on_items_load, on_before_load, on_hover, on_hover_out){
	var cluster3d = new THREEx.ClusterPlot3d(plot_options)
		.addEvent("onItemLoad", on_item_load)
		.addEvent("onItemsLoaded", on_items_load)
		.addEvent("onBeforeLoad", on_before_load)
		.addEvent("onHover", on_hover)
		.addEvent("onHoverOut", on_hover_out)
		.doDrawBackground(container_id)
		.doParseData(data, data_options)
		.doDrawData();

	return cluster3d;
};