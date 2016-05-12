/**
 * Wrapper around J5 delta
 */

function Device( delta ) {
  this.delta = delta;
};
module.exports = Device;

Device.prototype.tap = function(x, y) {
  var coords = phoneCoords( x, y );
  console.log('tap', coords);
  this.delta.tap( coords[0], coords[1] );
}

Device.prototype.draw = function(coordinates) {
  var mapped = coordinates.map(function(coordinate) {
    return phoneCoords( coordinate[0], coordinate[1] );
  });
  this.delta.draw( mapped );
}

// Mapping between phone pixels and real world delta robot coordinates
function phoneCoords(x,y) {
  // Upper Left: moveTo(32,-62,-155)
  // Lower Right: moveTo(-38,53,-155)
  var x2 = mapRange( x, [ 0, 1040 ], [ 32, -38 ] );
  var y2 = mapRange( y, [ 0, 1920 ], [ -62, 53 ] );
  return [ x2, y2 ];
}

function mapRange(value, fromRange, toRange) {
  return ( value - fromRange[0] ) * ( toRange[1] - toRange[0] ) / ( fromRange[1] - fromRange[0] ) + toRange[0];
};