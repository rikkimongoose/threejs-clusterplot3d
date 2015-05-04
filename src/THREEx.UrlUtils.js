/*
ThreeJS Cluster Plot 3D

Url utils for 3D clustering plot based on ThreeJS library.

by Rikki Mongoose

See updates at http://github.com/rikkimongoose/threejs-clusterplot3d 

*/

/** @namespace */
var THREEx = THREEx || {};

THREEx.UrlUtils = {
    getUrlStr : function() {
        //used for unit test
        return location.search.substr(1);
    },
	getUrlVars : function(){
		var vars = {},
		    hashes = this.getUrlStr();
        if(!hashes)
            return {};
        hashes = hashes.split('&');
		for(var i = 0, len = hashes.length; i < len; i++) {
			var hash = hashes[i].split('=');
			vars[hash[0]] = hash[1];
	  	}
		return vars;
	},
	urlVars : null,
	getUrlVar : function(key) {
		if(!key) return null;
		if(!this.urlVars) this.urlVars = this.getUrlVars();
		return (this.urlVars[key] !== undefined) ? this.urlVars[key] : null;
	},
	toUrlVar : function(url, params) {
		var url_val = url || window.location.href.slice(0, window.location.href.indexOf('?')),
		    dict_params = params || this.urlVars;
		if(dict_params === undefined || !dict_params)
			return url_val;
		var params_str = "";
		for(var param_key in dict_params) {
			var param = param_key + "=" + dict_params[param_key];
			params_str += (!params_str) ? param : ("&" + param);
		}
		return params_str ? (url_val + "?" + params_str) : url_val;
	}
};