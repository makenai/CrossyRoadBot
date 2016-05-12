var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var cv = require('opencv');
var mjpegStreamer = require('./lib/mjpegStreamer');
var events = require('events');
var five = require('johnny-five');
var fs = require('fs');
var _ = require('lodash');
var Deltabot = require('../j5-delta/index');
var UVCControl = require('uvc-control');

var deltabot = null;
var camera = new cv.VideoCapture(0);
var cameraControl = new UVCControl(0x046d, 0x082d);
cameraControl.set('autoFocus', 0, function(error) {
  if (error) console.log(error);
});

var imageEvents = new events.EventEmitter();
var clientConfiguration = null;

var cameraInterval = setInterval(function() {
  camera.read(function(err, image) {
    imageEvents.emit('rawImage', image);
    if (clientConfiguration) {
      requestTransform(image, clientConfiguration, function(newImage) {
        imageEvents.emit('processedImage', newImage);
      });
    }
  });
}, 250);

app.use(express.static('public'));
app.get('/camera.mjpeg', mjpegStreamer(imageEvents, 'rawImage'));
app.get('/processed.mjpeg', mjpegStreamer(imageEvents, 'processedImage'));

io.on('connection', function(socket) {

  socket.on('configure', function(configuration) {
    if (!clientConfiguration || configuration.focus !== clientConfiguration.focus) {
      cameraControl.set('absoluteFocus', configuration.focus, function(error) {
        if (error) console.log(error);
      });
    }
    clientConfiguration = configuration;
  });

  socket.on('disconnect', function(){
    // clearInterval( cameraInterval );
    // camera.close();
    console.log('disconnected');
  });

  socket.on('tap', function(coordinate) {
    console.log('tap', coordinate);
    // Upper Left: moveTo(32,-62,-155)
    // Lower Right: moveTo(-38,53,-155)
    var x = mapRange( coordinate[0], [ 0, 1040 ], [ 32, -38 ] );
    var y = mapRange( coordinate[1], [ 0, 1920 ], [ -62, 53 ] );
    console.log([ x, y ]);
    delta.tap( x, y );
  });

  socket.on('draw', function(coordinates) {
    console.log('draw', coordinates);
    var mapped = coordinates.map(function(coordinate) {
      var x = mapRange( coordinate[0], [ 0, 1040 ], [ 32, -38 ] );
      var y = mapRange( coordinate[1], [ 0, 1920 ], [ -62, 53 ] );
      return [ x, y ];
    });
    delta.draw( mapped );
  });


});

var board = new five.Board({
  debug: false,
  repl: false
});

board.on("ready", function() {
  console.log('BOARD READY.');
  delta = new Deltabot({
    board: board,
    type: 'tapster'
  });
});

http.listen(3000, function() {
  console.log('Listening on http://localhost:3000')
});


function requestTransform(originalImage, options, callback) {
  var image = originalImage.copy();
  var corners = _.flatten( options.corners );
  var newCorners = getCorners(options.screenWidth, options.screenHeight);
  var matrix = image.getPerspectiveTransform( corners,  newCorners );
  image.warpPerspective(matrix, options.screenWidth, options.screenHeight, [255, 255, 255]);
  callback( image );
};

function getCorners(width,height) {
  return [0,0, width,0, width,height, 0,height];
};

function mapRange(value, fromRange, toRange) {
  return ( value - fromRange[0] ) * ( toRange[1] - toRange[0] ) / ( fromRange[1] - fromRange[0] ) + toRange[0];
};