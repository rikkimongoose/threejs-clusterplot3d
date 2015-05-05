/*
ThreeJS Cluster Plot 3D

Vector utils for 3D clustering plot based on ThreeJS library.

by Rikki Mongoose

See updates at http://github.com/rikkimongoose/threejs-clusterplot3d 

*/

/** @namespace */
var THREEx = THREEx || {};

THREEx.VectorUtils = {
    findKoeff : function(paramX1, paramX2, paramY1, paramY2, xdiv){
        if(xdiv === undefined ||
            xdiv == null)
            xdiv = 1 / (paramX1 - paramX2);
        return {
                koeffA : (paramY1 - paramY2) * xdiv,
                koeffB : ((paramY2 * paramX1) - (paramY1 * paramX2)) * xdiv
            };
    },
    findSector : function(x1, y1, x2, y2){
        if(x1 == x2 && y1 == y2) return 0;
        if(x2 <  x1 && y2 <= y1) return 1;
        if(x2 <= x1 && y2 >  y1) return 2;
        if(x2 >  x1 && y2 >= y1) return 3;
        if(x2 >= x1 && y2 <  y1) return 4;
        return 0;
    },
    generate3DFunc : function(point1, point2, spotlightKoeff){
        return {
            pointCamera : point1,
            pointCursor : point2,
            spotlight : spotlightKoeff || 0,
            paramsY : this.findKoeff(point1.x, point2.x, point1.y, point2.y),
            paramsZ : this.findKoeff(point1.x, point2.x, point1.z, point2.z),
            funcY : function(x) { return (this.paramsY.koeffA + this.spotlight) * x + this.paramsY.koeffB; },
            funcYR: function(y) { return (y - this.paramsY.koeffB) / (this.paramsY.koeffA + this.spotlight); },
            funcZ : function(x) { return (this.paramsZ.koeffA + this.spotlight) * x + this.paramsZ.koeffB; }
            funcZR: function(z) { return (z - this.paramsZ.koeffB) / (this.paramsZ.koeffA + this.spotlight); },
        };
    },
    generateSpotlight : function(point1, point2, spotlightSize){
        var spotlightKoeff = spotlightSize || 0.2;
        return {
            funcTop : this.generate3DFunc(point1, point2,  spotlightKoeff),
            funcBtm : this.generate3DFunc(point1, point2, -spotlightKoeff)
        };
    },
    checkCrossing2d : function(spotlight, objX1, objX2, objY1, objY2, sector){
        //TODO - check crossing here
        switch(sector){
            case 1:
                return true;
            case 2:
                return true;
            case 3:
                return true;
            case 4:
                return true;
        }
        return false;
    },
    checkCrossing : function(spotlight, pointObjTopLeft, pointObjBottomRight){
        var pointCamera = spotlight.pointCamera,
            pointCursor = spotlight.pointCursor,
            sectorXY = this.findSector(pointCamera.x, pointCamera.y, pointCursor.x, pointCursor.y),
            sectorXZ = this.findSector(pointCamera.x, pointCamera.z, pointCursor.x, pointCursor.z);
        //Check, are cursor and point in same destination
        if((sectorXY != this.findSector(pointCamera.x, pointCamera.y, pointObjTopLeft.x, pointObjTopLeft.y)) &&
           (sectorXY != this.findSector(pointCamera.x, pointCamera.y, pointObjTopLeft.x, pointObjTopLeft.y))) ||
           (sectorXZ != this.findSector(pointCamera.x, pointCamera.z, pointObjTopLeft.x, pointObjTopLeft.z))
          )
            return null;

        // check crossing XY
        if(!this.checkCrossing2d(spotlight,
                pointObjTopLeft.x, pointObjBottomRight.x,
                pointObjTopLeft.y, pointObjBottomRight.y,
                sectorXY))
            return null;

        // check crossing XZ
        if(!this.checkCrossing2d(spotlight,
                pointObjTopLeft.x, pointObjBottomRight.x,
                pointObjTopLeft.z, pointObjBottomRight.z,
                sectorXZ))
            return null;

        //MAth.pow in Chrome is slower then multiplication
        return  Math.sqrt(  (pointObjCenter.x - pointCamera.x) * (pointObjCenter.x - pointCamera.x) +
                            (pointObjCenter.y - pointCamera.y) * (pointObjCenter.y - pointCamera.y) +
                            (pointObjCenter.z - pointCamera.z) * (pointObjCenter.z - pointCamera.z) +
                            );
    },
    findClosest : function(pointCamera, pointCursor, elems, spotlightSize){
        var closestElem = null,
            closestElemDistance = null,
            spotlight = this.generateSpotlight(pointCamera, pointCursor, spotlightSize);

        for(var i = 0, len = elems.length; i < len; i++){
            var elem = elems[i],
                distance = this.checkCrossing(spotlight, elem.pointTopLeft, elem.pointRightBottom);
            if(newDistance == null) continue;
            if(closestElem && closestElemDistance < newDistance) continue;
            closestElem = elem;
            closestElemDistance = distance;
        }
        return closestElem;
    },
};