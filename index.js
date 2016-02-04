var express= require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var cv = require('opencv');
var fs = require('fs');
var _ = require('lodash');

app.use(express.static('public'));

io.on('connection', function(socket) {

  // Send a file list of available images on connect
  fs.readdir('./samples', function(err, files) {
    socket.emit('files', files);
  });

  socket.on('requestImage', function(values) {
    var options = _.reduce(values, function(opts, pair) {
      opts[ pair.name ] = pair.value;
      return opts;
    }, {});
    processImage(options, function() {
      socket.emit('reload');
    });
  });

  socket.on('disconnect', function(){
    console.log('disconnected');
  });

});

http.listen(3000, function() {
  console.log('Listening on http://localhost:3000')
});


function processImage(options, callback) {
  cv.readImage("./samples/" + options.image, function(err, image) {
    var imgCanny = image.copy();
    imgCanny.resize(800, 600);
    if (options.grayscale) {
      imgCanny.convertGrayscale();
    }
    imgCanny.canny(options.threshold1, options.threshold2);
    imgCanny.save('public/output.jpg');
    callback();
  });
}