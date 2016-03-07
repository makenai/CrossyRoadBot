var React = require('react');

var PhoneViewConfig = React.createClass({

  getInitialState() {
    return {
      corners: this.props.corners,
      width: this.props.width,
      height: this.props.height
    };
  },

  componentDidMount: function() {
    this.selector = new ScreenSelector( this.refs.rawFrame );
    if (this.state.corners) {
      this.selector.setPosition( this.state.corners );
    } else {
      this.onReset();
    }
    this.selector.on('update', function(position) {
      this.setState({ corners: position });
    }.bind(this));
  },

  componentWillUnmount: function() {
    this.selector.destroy();
  },

  componentWillUpdate: function() {
    this.selector.updatePosition();
  },

  getFilename: function() {
    if (this.props.frame) {
      return this.props.frame.filename + '?ts=' + this.props.frame.timestamp;
    } else {
      return '';
    }
  },

  onSave: function(e) {
    e.preventDefault();
    if (this.props.onConfig) {
      this.props.onConfig({
        corners: this.state.corners,
        width: this.state.width,
        height: this.state.height
      });
    }
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
    this.setState({ height: e.target.value });
  },

  changeWidth: function(e) {
    this.setState({ width: e.target.value });
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
            <img ref="frame" src="" className="img-responsive" />
          </div>
          <div className="col-md-8">
            <img ref="rawFrame" src={this.getFilename()} className="img-responsive" />
            <div className="form-inline">
              <button onClick={this.onReset} className="btn">Reset Bounds</button>
              {" "}
              <div className="form-group">
                <input type="text" className="form-control" id="screenWidth" onChange={this.changeWidth}
                  value={this.state.width} placeholder="width"/>
                x
                <input type="text" className="form-control" id="screenHeight" onChange={this.changeHeight}
                  value={this.state.height} placeholder="height"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

});

module.exports = PhoneViewConfig;