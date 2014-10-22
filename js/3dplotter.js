$(function(){
	var PLOTITEM_SPHERE = 1;
	var PLOTITEM_CUBE = 2;

	var sceneConfig = {
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
				size : 10,
				type : PLOTITEM_SPHERE,
				original_item : {}
			}
		]
	};
});