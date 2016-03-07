var React = require('react');
var PhoneViewConfig = require('./phoneViewConfig.jsx');

var PhoneView = React.createClass({

  getInitialState: function() {
    return {
      isConfiguring: false,
      corners: $.localStorage.get('corners'),
      screenWidth: $.localStorage.get('screenWidth') || 1080,
      screenHeight: $.localStorage.get('screenHeight') || 1920
    };
  },

  configureServer: function() {
    socket.emit('configure', this.state);
  },

  componentWillMount: function() {
    this.configureServer();
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
        screenHeight: configuration.height
      }, function() {
        this.configureServer();
      });
      $.localStorage.set('corners', configuration.corners);
      $.localStorage.set('screenWidth', configuration.width);
      $.localStorage.set('screenHeight', configuration.height);
  },

  getFilename: function() {
    if (this.props.frame) {
      return this.props.frame.filename + '?ts=' + this.props.frame.timestamp;
    } else {
      return '';
    }
  },

  render: function() {
    if (this.state.isConfiguring) {
      return (<PhoneViewConfig frame={this.props.rawFrame}
                width={this.state.screenWidth}
                height={this.state.screenHeight}
                corners={this.state.corners}
                onConfig={this.updateConfig}
                onClose={this.closeConfig} />);
    } else {
      return (
        <div>
          <img src={this.getFilename()} className="img-responsive" />
          <button onClick={this.showConfig}>Configure</button>
        </div>
      );
    }
  }

});

module.exports = PhoneView;