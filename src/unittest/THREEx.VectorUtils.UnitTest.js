QUnit.test( "findKoeff", function( assert ) {
    var point1 = { x : 1, y : 3 },
        point2 = { x : 3, y : 7 },
        koeffs = THREEx.VectorUtils.findKoeff(point1.x, point1.y, point2.x, point2.y);
    assert.equal( koeffs.koeffA, 2, "KoeffA = " + koeffs.koeffA );
    assert.equal( koeffs.koeffB, 1, "KoeffB = " + koeffs.koeffB );
});

QUnit.test( "createLinear2dFunc", function( assert ) {
    var pointX = 0,
        koeffA = 2,
        koeffB = 1,
        funcElem = THREEx.VectorUtils.createLinear2dFunc(koeffA, koeffB);
        results = funcElem.func(pointX);
    assert.equal( results[0], pointX, "Point X assigned" );
    assert.equal( results[1], 1, "Func(x) = " + results[1] );
});

QUnit.test( "findSector", function( assert ) {

});
QUnit.test( "findXParam", function( assert ) {

});