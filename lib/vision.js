var cv = require('opencv');

var buttons = [
  {
      name: 'finger',
      image: './public/templates/finger-md.png',
      size: [ 30, 45 ],
      threshold: 0.99,
      color: [ 0, 0, 255 ]
  },
  {
      name: 'earn',
      image: './public/templates/earn-md.png',
      size: [ 102, 44 ],
      threshold: 0.99,
      color: [ 255, 0, 0 ]
  },
  {
      name: 'play',
      image: './public/templates/play-md.png',
      size: [ 63, 53 ],
      threshold: 0.99,
      color: [ 0, 255, 0 ]
  }
];

function detectButton( image, button ) {
  // image.convertGrayscale();
  var match = image.matchTemplate(button.image, 3);
  var minMax = match.minMaxLoc();
  var maxPos = [ minMax.maxLoc.x, minMax.maxLoc.y ];
  var minPos = [ minMax.minLoc.x, minMax.minLoc.y ];
  return {
    found: minMax.maxVal > button.threshold,
    position: maxPos,
    theshold: minMax.maxVal,
    button: button
  };
}


function detectButtons(image, callback) {
  var detected = buttons.map(function (button) {
    return detectButton( image, button );
  });
  if (callback)
    return callback(null, detected);
  return detected;
}
module.exports.detectButtons = detectButtons;