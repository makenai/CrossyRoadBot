var cv = require('opencv');
var async = require('async');
var path = require('path');
var vision = require('./lib/vision');

// http://docs.opencv.org/2.4/doc/tutorials/features2d/feature_homography/feature_homography.html#feature-homography

async.auto({
  template: function(done) {
    cv.readImage("./templates/play.png", done);
  },
  images: [ 'template', function(results, done) {
    async.map([
      './screens/1.png',
      './screens/2.png',
      './screens/3.png',
      './screens/4.png',
      './screens/5.png',
      './screens/6.png',
      './screens/7.png',
      './screens/8.png',
      './screens/9.png',
      './screens/10.png',
      './screens/11.png',
      './screens/12.png',
      './screens/13.png',
      './screens/14.png',
      './screens/15.png',
      './screens/16.png',
      './screens/17.png',
      './screens/18.png'
    ], function(filename, callback) {
      cv.readImage(filename, function(error, image) {
        vision.detectButtons( image, function(error, results) {
          annotateImage( filename, image, results, callback );
        });
      });
    }, done);
  } ]
}, function(error, results) {
  if (error) {
    return console.log('Error:', error);
  }
  console.log( results );
});

function annotateImage(filename, image, detected, callback ) {
    var copy = image.copy();

    detected.forEach(function(button) {
      if (button.found) {
        copy.rectangle(button.position, button.button.size, button.button.color, 2);
        copy.putText( button.theshold.toString(), button.position[0], button.position[1], "HERSEY_PLAIN", [0,0,0], 1, 2);
      }
    });

    var outfile = './output/' + path.basename( filename );
    copy.save( outfile );

    callback(null, {
      input: filename,
      output: outfile
    });
}