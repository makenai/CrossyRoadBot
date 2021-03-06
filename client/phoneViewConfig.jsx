var React = require('react');

var PhoneViewConfig = React.createClass({

  getInitialState() {
    return {
      corners: this.props.corners,
      width: this.props.width,
      height: this.props.height,
      focus: this.props.focus,
      whiteBalance: this.props.whiteBalance,
      brightness: this.props.brightness,
      cameraNumber: this.props.cameraNumber
    };
  },

  componentWillUnmount: function() {
    this.selector.destroy();
  },

  updateConfig: function() {
    if (this.props.onConfig) {
      this.props.onConfig({
        corners: this.state.corners,
        width: this.state.width,
        height: this.state.height,
        focus: this.state.focus,
        whiteBalance: this.state.whiteBalance,
        brightness: this.state.brightness,
        cameraNumber: this.state.cameraNumber
      });
    }
  },

  onSave: function(e) {
    e.preventDefault();
    this.updateConfig();
    this.onClose(e);
  },

  onClose: function(e) {
    e.preventDefault();
    if (this.props.onClose) {
      this.props.onClose();
    }
  },

  onReset: function(e) {
    e.preventDefault();
    this.selector.setPosition([ [10,10], [100,10], [100,100], [10,100] ]);
  },

  changeHeight: function(e) {
    this.setState({ height: e.target.value }, function() {
      this.updateConfig();
    });
  },

  changeWidth: function(e) {
    this.setState({ width: e.target.value }, function() {
      this.updateConfig();
    });
  },

  changeFocus: function(e) {
    this.setState({ focus: e.target.value }, function() {
      this.updateConfig();
    });
  },

  changeBrightness: function(e) {
    this.setState({ brightness: e.target.value }, function() {
      this.updateConfig();
    });
  },

  changeWhiteBalance: function(e) {
    this.setState({ whiteBalance: e.target.value }, function() {
      this.updateConfig();
    });
  },

  changeCameraNumber: function(e) {
    this.setState({ cameraNumber: e.target.value }, function() {
      this.updateConfig();
    });
  },

  imageLoad: function(e) {
    this.selector = new ScreenSelector( this.refs.rawFrame );
    if (this.state.corners) {
      this.selector.setPosition( this.state.corners );
    } else {
      this.onReset();
    }
    this.selector.on('update', function(position) {
      this.setState({ corners: position }, function() {
        this.updateConfig();
      });
    }.bind(this));
  },

  render: function() {
    return (
      <div>
        <div className="row">
          <div className="col-md-12">
            <p>
              <button onClick={this.onSave} className="btn btn-primary">Close</button>
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <img ref="frame" src="/processed.mjpeg" className="img-responsive" />
          </div>
          <div className="col-md-8">
            <div className="form">
              <div className="panel panel-default">
                <div className="panel-body">
                  <img ref="rawFrame" src="/camera.mjpeg" onLoad={this.imageLoad} className="img-responsive" />
                </div>
                <div className="panel-footer">
                  <button onClick={this.onReset} className="btn" id="resetSelection">Reset Selection</button>
                </div>
              </div>
              <br />
              <div className="form-group">
                <label>Dimensions:</label>
                <input type="text" className="form-control" id="screenWidth" onChange={this.changeWidth}
                  value={this.state.width} placeholder="width" />
                x
                <input type="text" className="form-control" id="screenHeight" onChange={this.changeHeight}
                  value={this.state.height} placeholder="height"/>
              </div>
              <br />
              <div className="form-group">
                <label>Focus:</label>
                <input type="range" min="0" max="250" value={this.state.focus} onChange={this.changeFocus} name="focus" />
                ({this.state.focus})
              </div>
              <br />
              <div className="form-group">
                <label>White Balance:</label>
                <input type="range" min="2000" max="6500" value={this.state.whiteBalance} onChange={this.changeWhiteBalance} name="whiteBalance" />
                ({this.state.whiteBalance})
              </div>
              <br />
                <div className="form-group">
                  <label>Brightness:</label>
                  <input type="range" min="0" max="255" value={this.state.brightness} onChange={this.changeBrightness} name="brightness" />
                  ({this.state.brightness})
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

});

module.exports = PhoneViewConfig;