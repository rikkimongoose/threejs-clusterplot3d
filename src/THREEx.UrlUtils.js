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
		var vars = [];
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		var i = hashes.length;
		while(--i) {
			var hash = hashes[i].split('=');
			vars[hash[0]] = hash[1];
	  	}
		return vars;
	},
	UrlVars : null,
	getUrlVar : function(key) {
		if(!key) return null;
		if(!this.UrlVars) this.UrlVars = this.getUrlVars();
		return (typeof(this.UrlVars[key]) != "undefined") ? this.UrlVars[key] : null;
	},
	toUrlVar : function(url, params) {
		var dict_params = params || this.UrlVars;
		if(typeof dict_params == 'undefined'
			|| !dict_params
			|| !dict_params.length)
				return url;
		var params_str = "";
		for(var param_key in dict_params) {
			var param = param_key + "=" + dict_params[param_key];
			params_str += (!params_str) ? param : ("&" + param);
		}
		return url + "?" + params_str;
	}
};