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
var Device = require('./lib/device');
var UVCControl = require('uvc-control');
var vision = require('./lib/vision');

var device = null;
var camera = new cv.VideoCapture(0);
var cameraControl = new UVCControl(0x046d, 0x082d);
cameraControl.set('autoFocus', 0, function(error) {
  if (error) console.log(error);
});
cameraControl.set('autoWhiteBalance', 0, function(error) {
  if (error) console.log(error);
});

var imageEvents = new events.EventEmitter();
var clientConfiguration = null;

var cameraInterval = setInterval(function() {
  camera.read(function(err, image) {
    imageEvents.emit('rawImage', image);
    if (clientConfiguration) {
      requestTransform(image, clientConfiguration, function(newImage) {
        // tagButtons( newImage );
        imageEvents.emit('processedImage', newImage);
      });
    }
  });
}, 1000);

app.use(express.static('public'));
app.get('/camera.mjpeg', mjpegStreamer(imageEvents, 'rawImage'));
app.get('/processed.mjpeg', mjpegStreamer(imageEvents, 'processedImage'));

io.on('connection', function(socket) {

  socket.on('configure', function(configuration) {
    if (!clientConfiguration
        || configuration.focus !== clientConfiguration.focus
        || configuration.whiteBalance !== clientConfiguration.whiteBalance
        || configuration.brightness !== clientConfiguration.brightness
      ) {
      cameraControl.set('absoluteFocus', configuration.focus, function(error) {
        if (error) console.log(error);
      });
      cameraControl.set('whiteBalanceTemperature', configuration.whiteBalance, function(error) {
        if (error) console.log(error);
      });
      cameraControl.set('brightness', configuration.brightness, function(error) {
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
    device.tap( coordinate[0], coordinate[1] );
  });

  socket.on('draw', function(coordinates) {
    device.draw( coordinates );
  });

});

var board = new five.Board({
  debug: false,
  repl: false
});

board.on("ready", function() {
  console.log('BOARD READY.');
  var delta = new Deltabot({
    board: board,
    type: 'tapster'
  });
  device = new Device( delta );
});

http.listen(3000, function() {
  console.log('Listening on http://localhost:3000')
});

function tagButtons(image) {
  var detected = vision.detectButtons(image);
  detected.forEach(function(button) {
    if (button.found) {
      image.rectangle(button.position, button.button.size, button.button.color, 2);
      image.putText( button.theshold.toString(), button.position[0], button.position[1], "HERSEY_PLAIN", [0,0,0], 1, 2);
    }
  });
  return image;
}

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