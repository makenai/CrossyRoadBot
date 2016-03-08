var React = require('react');
var ReactDOM = require('react-dom');
var PhoneView = require('./phoneView.jsx')

var Crossy = React.createClass({

  getInitialState: function() {
    return {};
  },

  componentDidMount: function() {
  },

	render: function() {
		return (
			<div className="Crossy">
        <PhoneView image="/processed.mjpeg" />
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