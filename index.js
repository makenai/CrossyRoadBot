var express= require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var cv = require('opencv');
var fs = require('fs');
var _ = require('lodash');

var CFG = {
  frameRate: 700
};

app.use(express.static('public'));

io.on('connection', function(socket) {

  var camera = new cv.VideoCapture(0);

  var cameraInterval = setInterval(function() {
    camera.read(function(err, im) {
      // MJPEG instead?
      // http://stackoverflow.com/questions/25845219/c-opencv-streaming-camera-video-images-mjpeg-from-socket-into-browser-windo
      im.saveAsync('./public/frame.jpg', function(error, ok) {
        if (!error) {
          socket.emit('gotRawFrame', {
            filename: 'frame.jpg',
            timestamp: new Date().getTime()
          });
          if (CFG.clientConfig) {
            requestTransform(im, CFG.clientConfig, function(error, ok) {
              socket.emit('gotFrame', {
                filename: 'output.jpg',
                timestamp: new Date().getTime()
              });
            });
          }
        }
      });
    });
  }, CFG.frameRate);

  socket.on('configure', function(configuration) {
    CFG.clientConfig = configuration;
    console.log(configuration);
  });

  socket.on('disconnect', function(){
    clearInterval( cameraInterval );
    camera.close();
    console.log('disconnected');
  });

});

http.listen(3000, function() {
  console.log('Listening on http://localhost:3000')
});

function requestTransform(originalImage, options, callback) {
  console.log( options );
  var image = originalImage.copy();
  var corners = _.flatten( options.corners );
  console.log( corners );
  var newCorners = getCorners(options.screenWidth, options.screenHeight);
  var matrix = image.getPerspectiveTransform( options.corners,  newCorners );
  image.warpPerspective(matrix, options.screenWidth, options.screenHeight, [255, 255, 255]);
  image.saveAsync('./public/output.jpg', callback);
};

function getCorners(width,height) {
  return [0,0, width,0, width,height, 0,height];
};
