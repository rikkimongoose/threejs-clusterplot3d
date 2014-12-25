/*
ThreeJS Cluster Plot 3D

Url utils for 3D clustering plot based on ThreeJS library.

by Rikki Mongoose

See updates at http://github.com/rikkimongoose/threejs-clusterplot3d 

*/

/** @namespace */
var THREEx	= THREEx || {};

THREEx.UrlUtils = {
	getUrlVars : function(){
		var vars = {};
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		var i = hashes.length;
		while(i--) {
			var hash = hashes[i].split('=');
			vars[hash[0]] = hash[1];
	  	}
		return vars;
	},
	urlVars : null,
	getUrlVar : function(key) {
		if(!key) return null;
		if(!this.urlVars) this.urlVars = this.urlVars();
		return (typeof(this.urlVars[key]) != "undefined") ? this.urlVars[key] : null;
	},
	toUrlVar : function(url, params) {
		var url_val = url || window.location.href.slice(0, window.location.href.indexOf('?'));
		var dict_params = params || this.urlVars;
		if(typeof dict_params == 'undefined' || !dict_params)
			return url_val;
		var params_str = "";
		for(var param_key in dict_params) {
			var param = param_key + "=" + dict_params[param_key];
			params_str += (!params_str) ? param : ("&" + param);
		}
		return params_str ? (url_val + "?" + params_str) : url_val;
	}
};