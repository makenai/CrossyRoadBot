var Machine = require('./lib/machine');

var device = {
  tap: function(x,y,cb) {
    console.log('TAP',x,y);
    if (cb) cb();
  },
  tapButton: function(button, cb) {
    console.log('tap button', button.name);
    if (cb) cb();
  }
};

var crossyRoad = new Machine( device );

crossyRoad.on("transition", function (data){
    console.log(data.fromState + " to " + data.toState);
});

crossyRoad.foundButton({ name: 'finger', position: [10,10] });
setTimeout(function() {
  crossyRoad.foundButton({ name: 'play', position: [10,10] });
}, 5000);

setTimeout(function() {
  crossyRoad.foundButton({ name: 'earn', position: [10,10] });
}, 7000);
