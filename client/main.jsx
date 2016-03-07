var React = require('react');
var ReactDOM = require('react-dom');
var PhoneView = require('./phoneView.jsx')

var Crossy = React.createClass({

  getInitialState: function() {
    return {};
  },

  componentDidMount: function() {
    socket.on('gotRawFrame', function(data) {
      this.setState({ rawFrame: data });
    }.bind(this));
    socket.on('gotFrame', function(data) {
      this.setState({ frame: data });
    }.bind(this));
  },

	render: function() {
		return (
			<div className="Crossy">
        <PhoneView rawFrame={this.state.rawFrame} frame={this.state.frame} />
      </div>
		);
	}

});

window.Crossy = {
  mount: function(container) {
    ReactDOM.render(<Crossy />, container);
  }
};

module.exports = Crossy;