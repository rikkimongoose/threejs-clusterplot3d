/** @namespace */
var THREEx	= THREEx || {};

THREEx.ColorPalette = {
	HSLPALETTE : 1
};

THREEx.getColorPalette = function(n, palette) {
	if(typeof palette == "undefined" || !palette)
		palette = THREEx.ColorPalette.GGPLOT2;

	function isOnePointZero(n) {
    	return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
	}

	function bound01(n, max) {
    	if ((Math.abs(n - max) < 0.000001)) {
        	return 1;
    	}

    	return (n % max) / parseFloat(max);
	}
	function seq(from, to, length){
		if(!length) return [];

		if(from == to || length == 1) return [from];

		var output = [];

		var step = (to - from) / (length - 1);
		for(; from <= to; from += step)
			output.push(from);
		return output;
	};

	function hsl(h, s, l){
		return { h : h % 360, s : s % 101, l : l % 101 };
	}

	function rgb(r, g, b) {
		return { r : r, g : g, b : b};
	};

	function rgbtonum(rgb) {
		return rgb.r * 0x10000  + rgb.g * 0x100 + rgb.b;
	}

	function hsltorgb(hsl) {
		var r, g, b;
		var h = bound01(hsl.h, 360),
			s = bound01(hsl.s, 100),
			l = bound01(hsl.l, 100);

	    if(s == 0){
	        r = g = b = l; // achromatic
	    }else{
	        function hue2rgb(p, q, t){
	            if(t < 0) t += 1;
	            if(t > 1) t -= 1;
	            if(t < 1/6) return p + (q - p) * 6 * t;
	            if(t < 1/2) return q;
	            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
	            return p;
	        }

	        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	        var p = 2 * l - q;
	        r = hue2rgb(p, q, h + 1/3);
	        g = hue2rgb(p, q, h);
	        b = hue2rgb(p, q, h - 1/3);
	    }
    	return rgb(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255) );
	}

	function hsltonum(hcl) {
		return rgbtonum(hsltorgb(hcl));
	}

	function hslPalette(n) {
		var hue_from = 0,
			hue_to = 180,
			hue = seq(hue_from, hue_to, n),
			saturation = 100,
			luminance = 70;

		var colors_result = [];

		for(var i = 0; i < hue.length; i++)
			colors_result.push(hsltonum(hsl(hue[i], saturation, luminance)));

		return colors_result;
	};

	switch(palette)
	{
		default:
			return hslPalette(n);
	}
};