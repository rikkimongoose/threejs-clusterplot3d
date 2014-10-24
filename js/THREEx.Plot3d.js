var ThreeJs_plots = [];

function plot3d(elem_id, extract_rules_config, plot_view_config, data, onitemloaded, onloaded){
	var plot = {
		elem_id : elem_id,
		extract_rules_config : extract_rules_config,
		plot_view_config : plot_config,
		data : data,
		data_config : null,
		itemloaded : [],
		loaded : []
	};

	if(typeof onitemloaded == "function"){
		plot.itemloaded.push(onitemloaded);
	}
	
	if(typeof onloaded == "function"){
		plot.loaded.push(onloaded);
	}

	plot.elem = document.getElementById(elem_id);
	if(!plot.elem){
		console.error("Element with id '%s' is not found.", elem_id);
		return;
	}

	plot.extract_rules = extract_rules_config(plot.extract_rules_config);

	plot.data_items = extract_data(plot.data, plot,extract_rules)

	THREE_plots.push(plot);
	return plot;
}

function compile_extract_rules(config){

}

function extract_data(data, rules){

}