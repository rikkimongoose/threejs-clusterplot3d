

/** @namespace */
var THREEx	= THREEx || {};

var ThreeJs_plots = [];

THREEx.ClusterPlot3d = function(plot_options) {
	this.keyboard = new THREEx.KeyboardState();
	this.clock = new THREE.Clock();

	var get_rule_value = function(rule_key) {
		if(typeof rules[rule_key] != "undefined"){
			if(typeof rules[rule_key] == "function")
				return rules[rule_key];
			return function(item) { return item[rules[rule_key]]; };
		}
		var rule_key_const = rule_key + "-const";
		if(typeof rules[rule_key_const] != "undefined")
			return function() { return rules[rule_key_const] };
		if(typeof default_rules[rule_key] != "undefined")
			return default_rules[rule_key];
		return null;
	}

	this.options = plot_options || {};
	this.options.show_stats = false;
	this.options.stratch = true;
	this.options.show_grids = true;

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

	this.options.steps_size = 100;
	this.options.steps_count = 20;
	this.options.steps_step = (this.options.steps_size / this.options.steps_count) * 2;
	this.options.steps_count_koeff = this.options.steps_step;

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
		gridXZ.setColors( new THREE.Color(0x006600), new THREE.Color(0x006600) );
		gridXZ.position.set( 100,0,100 );
		this.scene.add(gridXZ);
			
		var gridXY = new THREE.GridHelper(this.grid_options.xy.size, this.grid_options.xy.step);
		gridXY.position.set( 100,100,0 );
		gridXY.rotation.x = Math.PI/2;
		gridXY.setColors( new THREE.Color(0x000066), new THREE.Color(0x000066) );
		this.scene.add(gridXY);

		var gridYZ = new THREE.GridHelper(this.grid_options.yz.size, this.grid_options.yz.step);
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
			return getSphereGeometry(size);
		else if(item_type == PLOT_TYPE.ITEM.CUBE)
			return getCubeGeometry(size * 2);
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
	
	this.draw_plot = function() {
		var item_data_index = this.parsed_data.length;
		while(item_data_index--) {
			var item_data = this.parsed_data[item_data_index];
			var geometry = this.getGeometry(item_data.type, item_data.size, item_data);
			var material = this.getMaterial(item_data.material, item_data.color);
			var mesh = new THREE.Mesh( geometry, material );

			if(item_data.type == PLOT_TYPE.ITEM.BAR)
				mesh.position.set(item_data.x,( item_data.y - item_data.size / 2) / 2, item_data.z);
			else
				mesh.position.set(item_data.x, item_data.y, item_data.z);
			this.scene.add(mesh);

			if(item_data.outline_color && item_data.outline_expand) {
				var outlineMaterial = new THREE.MeshBasicMaterial( { color: item_data.outline_color, side: THREE.BackSide } );
				var outlineMesh = new THREE.Mesh( geometry, outlineMaterial );
				outlineMesh.position.x = mesh.position.x;
				outlineMesh.position.y = mesh.position.y;
				outlineMesh.position.z = mesh.position.z;
				outlineMesh.scale.multiplyScalar(item_data.outline_expand);
				this.scene.add( outlineMesh );
			}
		}
	}

	var PARSE_RULES_TYPES = {
		NUMERIC : 0,
		COLOR : 1,
		FIGURE : 2,
		MATERIAL : 3
	};

	this.parse_rules = {
			x : {
				type : PARSE_RULES_TYPES.NUMERIC,
				func : null,
				is_normalised : true
			},
			y : {
				type : PARSE_RULES_TYPES.NUMERIC,
				func : null,
				is_normalised : true
			},
			z : {
				type : PARSE_RULES_TYPES.NUMERIC,
				func : null,
				is_normalised : true
			},
			color : {
				type : PARSE_RULES_TYPES.COLOR,
				func : null,
				is_normalised : false
			},
			outline_color : {
				type : PARSE_RULES_TYPES.COLOR,
				func : null,
				is_normalised : false
			},
			outline_expand : {
				type : PARSE_RULES_TYPES.NUMERIC,
				func : null,
				is_normalised : false
			},
			material : {
				type : PARSE_RULES_TYPES.MATERIAL,
				func : null,
				is_normalised : false
			},
			size : {
				type : PARSE_RULES_TYPES.NUMERIC,
				func : null,
				is_normalised : false
			},
			type : {
				type : PARSE_RULES_TYPES.FIGURE,
				func : null,
				is_normalised : false
			}
		};

	this.parse_rules_data_columns = [];

	this.prepare_parse_rules = function(rules) {
		var default_rules_values = {
			x : 0,
			y : 0,
			z : 0,
			color : 0xFF0000,
			outline_color : null,
			outline_expand : 1.2,
			material : PLOT_TYPE.MATERIAL.LAMBER,
			size : 1,
			type : PLOT_TYPE.ITEM.SPHERE
		};
		var default_rules = {
			x : function(item) { return (typeof item[0] != "undefined") ? item[0] : default_rules_values.x; },
			y : function(item) { return (typeof item[1] != "undefined") ? item[1] : default_rules_values.y; },
			z : function(item) { return (typeof item[2] != "undefined") ? item[2] : default_rules_values.z; },
			color : function() { return default_rules_values.color; },
			outline_color : function() { return default_rules_values.outline_color; },
			outline_expand : function() { return default_rules_values.outline_expand; },
			material : function() { return default_rules_values.material; },
			size : function(item) { return (typeof item[3] != "undefined") ? item[3] : default_rules_values.size; },
			type : function() { return PLOT_TYPE.ITEM.SPHERE; }
		};

		var get_rule_value = function(rule_key, is_normalised) {
			if(typeof rules[rule_key] != "undefined"){
				if(typeof rules[rule_key] == "function")
					return rules[rule_key];
				return { func: function(item) { return item[rules[rule_key]]; }, is_changed : true };
			}
			var rule_key_const = rule_key + "-const";
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
		var normalise_numeric = function(data_to_normalise, key, steps_count, steps_count_koeff) {
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
		};
		var normalise_color = function(data_to_normalise, key) {
			/* TODO :  palettes like R */
		};

		for(var rule_key in this.parse_rules_data_columns) {
			var data_column_key = this.parse_rules_data_columns[rule_key];
			var rule = this.parse_rules[data_column_key];
			if(rule.type == PARSE_RULES_TYPES.NUMERIC){
				normalise_numeric(this.parsed_data, data_column_key, this.options.steps_count, this.options.steps_count_koeff);
			} else if (rule.type == PARSE_RULES_TYPES.COLOR){
				normalise_color(this.parsed_data, data_column_key);
			}
		}
	}

	this.parse_data = function(data) {
		this.source_data = data;
		this.raw_parsed_data = [];
		this.parsed_data = [];

		var source_data_length = data.length;
		for(var i = 0; i < source_data_length; i++){
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
		console.log(this.parsed_data);
	}
}

THREEx.ClusterPlot3d.prototype.doDrawBackground = function(elem_id) {
	return this.background(elem_id);
}
THREEx.ClusterPlot3d.prototype.doDrawData = function(){
	this.draw_plot();
}

THREEx.ClusterPlot3d.prototype.doParseData = function(data, data_parse_config) {
	this.prepare_parse_rules(data_parse_config);
	this.parse_data(data);
	//this.drawData();
}

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
}