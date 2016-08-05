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
          device.tap(250,250);
          this.transition('playing');
        }
      },

      playing: {
        _onEnter: function() {
          this.timer = setInterval(function() {
            device.tap(250,250);
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

        _onEnter: function() {
          setTimeout(function() {
            this.handle('adOver');
          }.bind(this), 25000);
        },

        adOver: function() {
          device.tap(250,250, function() {
            setTimeout(function() {
              device.tap(50,0, function() {
                this.transition('gameOver');
              }.bind(this));
            }.bind(this), 5000);
          }.bind(this));
        }

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