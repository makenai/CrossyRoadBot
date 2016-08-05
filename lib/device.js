/**
 * Wrapper around J5 delta
 */

function Device( delta, screenSize ) {
  this.delta = delta;
  this.screenSize = screenSize;
};
module.exports = Device;

Device.prototype.setScreenSize = function(width, height) {
  this.screenSize = [ width, height ];
}

Device.prototype.tap = function(x, y, callback) {
  var coords = this.phoneCoords( x, y );
  console.log('TAP', coords );
  this.delta.tap( coords[0], coords[1], callback );
}

Device.prototype.tapButton = function(button, callback) {
  var name = button.button.name;
  var x = button.position[0] + button.button.size[0] / 2;
  var y = button.position[1] + button.button.size[1] / 2;
  console.log('TAP_BUTTON', name, 'at', x, y );
  this.tap( x, y, callback );
}

Device.prototype.draw = function(coordinates) {
  var mapped = coordinates.map(function(coordinate) {
    return this.phoneCoords( coordinate[0], coordinate[1] );
  }.bind(this));
  this.delta.draw( mapped );
}

// Mapping between phone pixels and real world delta robot coordinates
Device.prototype.phoneCoords = function(x,y) {
  // Upper Left: moveTo(32,-62,-155)
  // Lower Right: moveTo(-38,53,-155)
  console.log( this.screenSize );
  var x2 = mapRange( x, [ 0, this.screenSize[0] || 540 ], [ 32, -38 ] );
  var y2 = mapRange( y, [ 0, this.screenSize[1] || 960 ], [ -62, 53 ] );
  return [ x2, y2 ];
}

function mapRange(value, fromRange, toRange) {
  return ( value - fromRange[0] ) * ( toRange[1] - toRange[0] ) / ( fromRange[1] - fromRange[0] ) + toRange[0];
};