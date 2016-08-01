var machina = require('machina');

module.exports = function(device) {

  return new machina.Fsm({

    initialState: 'titleScreen',

    foundButton: function(button) {
      this.handle(button.button.name, button);
    },

    states: {

      titleScreen: {
        finger: function(button) {
          // Tap anywhere. Then transition to playing.
          device.tap(500,500);
          this.transition('playing');
        }
      },

      playing: {
        _onEnter: function() {
          this.timer = setInterval(function() {
            device.tap(500,500);
          }.bind(this), 2000);
        },

        _onExit: function() {
          clearInterval(this.timer);
        },

        play: function() {
          this.transition('gameOver');
        }
      },

      watching: {
        // Long delay. Did the screen stop changing? Click bottom right. Transition to gameOver.
        // Start comparing screen
      },

      gameOver: {

        earn: function(button) {
          device.tapButton(button);
          this.transition('watching');
        },

        play: function(button) {
          device.tapButton(button);
          this.transition('titleScreen');
        },

      }
    }

  });

};