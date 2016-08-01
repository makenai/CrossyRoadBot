var React = require('react');
var PhoneViewConfig = require('./phoneViewConfig.jsx');

var PhoneView = React.createClass({

  getInitialState: function() {
    return {
      isConfiguring: false,
      corners: $.localStorage.get('corners'),
      screenWidth: $.localStorage.get('screenWidth') || 1080,
      screenHeight: $.localStorage.get('screenHeight') || 1920,
      focus: $.localStorage.get('focus') || 32,
      whiteBalance: $.localStorage.get('whiteBalance') || 3400,
      brightness: $.localStorage.get('brightness') || 82,
      transition: '...'
    };
  },

  configureServer: function() {
    socket.emit('configure', this.state);
  },

  componentWillMount: function() {
    this.configureServer();
  },

  componentDidMount: function() {
    socket.on('transition', function(data) {
      this.setState({ transition: JSON.stringify(data,null,2) });
    }.bind(this));
  },

  showConfig: function() {
    this.setState({ isConfiguring: true });
  },

  closeConfig: function() {
    this.setState({ isConfiguring: false });
  },

  updateConfig: function(configuration) {
    this.setState({
      corners: configuration.corners,
      screenWidth: configuration.width,
      screenHeight: configuration.height,
      focus: configuration.focus,
      whiteBalance: configuration.whiteBalance,
      brightness: configuration.brightness
    }, function() {
      this.configureServer();
    });
    $.localStorage.set('corners', configuration.corners);
    $.localStorage.set('screenWidth', configuration.width);
    $.localStorage.set('screenHeight', configuration.height);
    $.localStorage.set('focus', configuration.focus);
    $.localStorage.set('whiteBalance', configuration.whiteBalance);
    $.localStorage.set('brightness', configuration.brightness);
  },

  naturalCoords: function(pageX,pageY) {
    var screenImage = this.refs.screenImage;
    var offset = $(screenImage).offset();
    var x = pageX - offset.left;
    var y = pageY - offset.top;
    var naturalX = Math.round( x * (screenImage.naturalWidth / screenImage.width) );
    var naturalY = Math.round( y * (screenImage.naturalHeight / screenImage.height) );
    return [ naturalX, naturalY ];
  },

  mouseDown: function(e) {
    this.coords = [];
    this.setState({ drawing: true });
  },

  mouseMove: function(e) {
    if (this.state.drawing) {
      var coords = this.naturalCoords( e.pageX, e.pageY );
      this.coords.push( coords );
    }
  },

  mouseUp: function(e) {
    if (this.state.drawing) {
      if ( this.coords.length > 0 ) {
        socket.emit('draw', this.coords);
      } else {
        var coords = this.naturalCoords( e.pageX, e.pageY );
        socket.emit('tap', coords);
      }
      this.setState({ drawing: false });
    }
  },

  render: function() {
    if (this.state.isConfiguring) {
      return (<PhoneViewConfig
                width={this.state.screenWidth}
                height={this.state.screenHeight}
                corners={this.state.corners}
                focus={this.state.focus}
                whiteBalance={this.state.whiteBalance}
                brightness={this.state.brightness}
                onConfig={this.updateConfig}
                onClose={this.closeConfig} />);
    } else {
      return (
        <div className="row">
          <div className="col-md-4">
            <img src="/processed.mjpeg" className="phoneViewImage img-responsive"
              ref="screenImage"
              onMouseDown={this.mouseDown}
              onMouseMove={this.mouseMove}
              onMouseUp={this.mouseUp} />
          </div>
          <div className="col-md-8">
            <button className="btn" onClick={this.showConfig}>Configure</button>
            <pre>{this.state.transition}</pre>
          </div>
        </div>
      );
    }
  }

});

module.exports = PhoneView;