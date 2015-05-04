/*
ThreeJS Cluster Plot 3D

Vector utils for 3D clustering plot based on ThreeJS library.

by Rikki Mongoose

See updates at http://github.com/rikkimongoose/threejs-clusterplot3d 

*/

/** @namespace */
var THREEx = THREEx || {};

THREEx.VectorUtils = {
    function doFindKoeff(paramX1, paramX2, paramY1, paramY2, xdiv){
        if(xdiv === undefined ||
            xdiv == null)
            xdiv = 1 / (paramX1 - paramX2);
        return {
                koeffA : (paramY1 - paramY2) * xdiv,
                koeffB : ((paramY2 * paramX1) - (paramY1 * paramX2)) * xdiv
            };
    }

    function doGenerateFunc(point1, point2){
        function LinearFuncElem(koeffA, koeffB) {
            this.koeffA = koeffA;
            this.koeffB = koeffB;
            this.func = function(x){
                return this.koeffA*x + this.koeffB;
            };
        }
        function LinearFunc(x_index, dim){
            this.koeffA = new Array(dim - 1);
            this.koeffB = new Array(dim - 1);
            this.xIndex = x_index;
            this.func = function(x){
                var result = new Array(dim);
                for(var i = 0, ki = 0; i < dim; i++){
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

        function generateLinearFunc(point_data){
            var linearFunc = new LinearFunc(point_data.xparam_index, point_data.params_y_len);
            for(var i = 0; i < point_data.params_y_len; i++){
                var koeff = doFindKoeff(p);
            }
            return linearFunc;
        }
        var point_data = this.findXParam(param1, param2);
        var linearFunc = generateLinearFunc(point_data); 
    }
    return 
    {
    generateFunc : doGenerateFunc,
    findKoeff : doFindKoeff,
    findXParam : function (point1, point2){
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
            //найден столбец x
            if(xparam_index < 0 &&
                point1[pi] != point2[pi]){
                xparam_index = pi;
                data1.paramx = point1[pi];
                data2.paramx = point2[pi];
                continue;
            }
            data1.params[parami] = point1[pi];
            data2.params[parami] = point2[pi];
            parami++;
        }
        //Вектора одинаковые
        if(xparam_index < 0)
            throw new Error("Provided points are equal. It's impossible to build a line by 2 points.");

        return {
            data1 : data1,
            data2 : data2,
            params_y_len : params_y_len,
            xparam_index : xparam_index
        };
    },

};