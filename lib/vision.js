var cv = require('opencv');

var buttons = [
  {
      name: 'play',
      image: './templates/play-lg.png',
      size: [ 125, 105 ],
      threshold: 0.998,
      color: [ 0, 255, 0 ]
  },
  {
      name: 'earn',
      image: './templates/earn-lg.png',
      size: [ 204, 87 ],
      threshold: 0.998,
      color: [ 255, 0, 0 ]
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