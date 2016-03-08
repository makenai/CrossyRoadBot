var express= require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var cv = require('opencv');
var mjpegStreamer = require('./lib/mjpegStreamer');
var events = require('events');
var fs = require('fs');
var _ = require('lodash');

var camera = new cv.VideoCapture(0);
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
    clientConfiguration = configuration;
  });

  socket.on('disconnect', function(){
    // clearInterval( cameraInterval );
    // camera.close();
    console.log('disconnected');
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
