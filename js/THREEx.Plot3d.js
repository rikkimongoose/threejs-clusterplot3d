var ThreeJs_plots = [];

function drawPlot(elem_id, config, data, onitemloaded, onloaded){
	var plot = {
		elem_id : elem_id,
		config : config,
		data : data,
		itemloaded : [],
		loaded : []
	};

	if(typeof onitemloaded == "function"){
		plot.itemloaded.push(onitemloaded);
	}
	
	if(typeof onloaded == "function"){
		plot.loaded.push(onloaded);
	}

	THREE_plots.push(plot);
	return plot;
}