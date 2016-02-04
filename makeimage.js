var cv = require('opencv');

// http://www.pyimagesearch.com/2014/05/05/building-pokedex-python-opencv-perspective-warping-step-5-6/
// http://stackoverflow.com/questions/8667818/opencv-c-obj-c-detecting-a-sheet-of-paper-square-detection

var corners = [
  2664, 621, // top left
  3120, 1550, // top right
  258, 1662, // bottom right
  583, 675 // bottom left
]

var dest = [
  0,0,
  300,0,
  300,500,
  0,500
]


var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R
var RED   = [0, 0, 255]; // B, G, R

cv.readImage("./samples/IMG_4152.JPG", function(err, image) {

  // Matrix Transform
  // var matrix = image.getPerspectiveTransform(corners, dest);
  // image.warpPerspective(matrix, 300, 500, [255, 255, 255]);

  // Edge Detection
  var canny = image.copy();
  canny.medianBlur(9);
  canny.convertGrayscale();
  canny.bilateralFilter(11, 17, 17);
  canny.canny(10,200);
  var contours = canny.findContours();
  for(var i=0; i<contours.size(); i++) {
    if(contours.area(i) > 2500) {
      var moments = contours.moments(i);
      var cgx = Math.round(moments.m10 / moments.m00);
      var cgy = Math.round(moments.m01 / moments.m00);
      image.drawContour(contours, i, GREEN);
      image.line([cgx - 5, cgy], [cgx + 5, cgy], RED);
      image.line([cgx, cgy - 5], [cgx, cgy + 5], RED);
    }
  }

  image.save('./out.jpg');

});
