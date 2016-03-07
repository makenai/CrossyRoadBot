var express= require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var cv = require('opencv');
var fs = require('fs');
var _ = require('lodash');

app.use(express.static('public'));

io.on('connection', function(socket) {

  var camera = new cv.VideoCapture(0);

  var cameraInterval = setInterval(function() {
    camera.read(function(err, im) {
      im.save('public/frame.jpg');
      socket.emit('reload');
    });
  }, 500);


  // Send a file list of available images on connect
  fs.readdir('./samples', function(err, files) {
    socket.emit('files', files);
  });

  socket.on('disconnect', function(){
    clearInterval( cameraInterval );
    camera.close();
    console.log('disconnected');
  });

  socket.on('requestCanny', function(values) {
    var options = _.reduce(values, function(opts, pair) {
      opts[ pair.name ] = pair.value;
      return opts;
    }, {});
    processCanny(options, function() {
      socket.emit('reload');
    });
  });

  socket.on('requestTransform', function(values) {
    var options = {
      width: 300,
      height: 533,
      frame: values.frame
    }
    processTransform(options, function() {
      socket.emit('reload');
    });
  });

});

http.listen(3000, function() {
  console.log('Listening on http://localhost:3000')
});

var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R
var RED   = [0, 0, 255]; // B, G, R

function getCorners(width,height) {
  return [0,0, width,0, width,height, 0,height];
}

function processTransform(options, callback) {
  cv.readImage("./public/frame.jpg", function(err, image) {
    image.resize(800, 600);
    image.save('public/original.jpg');
    var corners = _.flatten( options.frame );
    var newCorners = getCorners(options.width, options.height);
    var matrix = image.getPerspectiveTransform( corners,  newCorners );
    image.warpPerspective(matrix, options.width, options.height, [255, 255, 255]);
    image.save('public/output.jpg');
    callback();
  });
};

function processCanny(options, callback) {
  cv.readImage("./samples/" + options.image, function(err, image) {
    var imgCanny = image.copy();
    imgCanny.resize(800, 600);
    var imgOriginal = imgCanny.copy();
    if (options.grayscale) {
      imgCanny.convertGrayscale();
    }
    if (options.bilateralFilter) {
      imgCanny.bilateralFilter(options.diameter, options.sigmaColor, options.sigmaSpace);
    }
    if (options.canny) {
      imgCanny.canny(options.threshold1, options.threshold2);
    }
    if (options.contours) {
      var contours = imgCanny.findContours();
      for(var i=0; i<contours.size(); i++) {
        if(contours.area(i) > options.area) {
          var moments = contours.moments(i);
          var cgx = Math.round(moments.m10 / moments.m00);
          var cgy = Math.round(moments.m01 / moments.m00);
          imgOriginal.drawContour(contours, i, GREEN, 2);
          imgOriginal.line([cgx - 5, cgy], [cgx + 5, cgy], RED, 2);
          imgOriginal.line([cgx, cgy - 5], [cgx, cgy + 5], RED, 2);
        }
      }
    }
    imgOriginal.save('public/original.jpg');
    imgCanny.save('public/output.jpg');
    callback();
  });
}