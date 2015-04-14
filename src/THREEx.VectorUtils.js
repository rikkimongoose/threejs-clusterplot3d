/*
ThreeJS Cluster Plot 3D

Vector utils for 3D clustering plot based on ThreeJS library.

by Rikki Mongoose

See updates at http://github.com/rikkimongoose/threejs-clusterplot3d 

Documentation powered by JSDoc.
*/

/** @namespace */
var THREEx = THREEx || {};

THREEx.VectorUtils = (function(){
    function findKoeff(paramX1, paramX2, paramY1, paramY2, xdiv){
        if(xdiv === undefined ||
            xdiv == null)
            xdiv = 1 / (paramX1 - paramX2);
        return {
                koeffA : (paramY1 - paramY2) * xdiv,
                koeffB : ((paramY2 * paramX1) - (paramY1 * paramX2)) * xdiv
            };
    }

    /**
     * Create 2D function object.
     * @param {array} koeffA - A koefficient array.
     * @param {array} koeffB - B koefficient array.
     */
    function createLinear2dFunc(koeffA, koeffB) {
        return {
            koeffA : koeffA,
            koeffB : koeffB,
            xIndex : 0,
            func : function(x){
                return [x, this.koeffA*x + this.koeffB];
            }
        };
    }

    function findSector(x1, y1, x2, y2){
        if(x1 == x2 && y1 == y2) return 0;
        if(x2 <  x1 && y2 <= y1) return 1;
        if(x2 <= x1 && y2 >  y1) return 2;
        if(x2 >  x1 && y2 >= y1) return 3;
        if(x2 >= x1 && y2 <  y1) return 4;
    }

    function findXParam(point1, point2){
        var params_len = point1.length,
            params_y_len = params_len - 1,
            data1 = {
                params : new Array(params_y_len),
                paramx : null
            },
            data2 = {
                params : new Array(params_y_len),
                paramx : null
            },
            xparam_index = -1;
        for(var pi = 0, parami = 0; pi < params_len; pi++){
            // x value is found
            if(xparam_index < 0 &&
                point1[pi] != point2[pi]){
                xparam_index = pi;
                data1.paramx = point1[pi];
                data2.paramx = point2[pi];
                continue;
            }
            // non-x value
            data1.params[parami] = point1[pi];
            data2.params[parami] = point2[pi];
            parami++;
        }
        //Вектора одинаковые
        if(xparam_index < 0)
            throw new Error("Provided points are equal. It's impossible to build a line by 2 points.");
    }

    /**
     * Create multi-dimensional function object.
     * @param {int} x_index - Index of x params in input vector arrays.
     * @param {int} dim - Dimensions of input arrays.
     * @param {array} koeffA - A koefficient array.
     * @param {array} koeffB - B koefficient array.
     */
    function createLinearFunc(x_index, dim, koeffA, koeffB){
        return {
            dim : dim || 3, //3D by default
            koeffA : koeffA || new Array(dim - 1),
            koeffB : koeffB || new Array(dim - 1),
            xIndex : x_index,
            func : function(x){
                var result = new Array(this.dim);
                for(var i = 0, ki = 0; i < this.dim; i++){
                    if(this.xIndex == i){
                        result[i] = x;
                        continue;
                    }
                    result[i] = this.koeffA[ki]*x + this.koeffB[ki];
                    ki++;
                }
                return result;
            }
        }
    }

    function generateLinearFunc(point1, point2){

    }

    function isCrossing(linearFunc, pointToCheck){

    }

    return {
        findKoeff : findKoeff,
        createLinear2dFunc : createLinear2dFunc,
        createLinearFunc : createLinearFunc,
        generateLinearFunc : generateLinearFunc,
        isCrossing : isCrossing,
        findXParam : findXParam,
        findSector : findSector
    };
})();