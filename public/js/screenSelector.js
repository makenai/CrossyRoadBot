var ScreenSelector = function(imageElement) {
  this.imageElement = imageElement;
  this.init();
}

ScreenSelector.prototype = {

  init: function() {
    this.handles = [];
    this.callbacks = {};
    this.addCanvas();
    this.addControls();
    this.updatePosition();
  },

  addCanvas: function() {
    this.canvasElement = document.createElement('canvas');
    this.wrapper = $('<div />', { id: 'imageOverlayWrap' });
    this.wrapper.append( this.canvasElement );
    $(this.imageElement).after( this.wrapper );
    this.canvas = new fabric.Canvas(this.canvasElement, {
      selection: false
    });
  },

  addControls: function() {
    this.handles = [
      this.createDragHandle(10,10),
      this.createDragHandle(10,100),
      this.createDragHandle(100,100),
      this.createDragHandle(100,10)
    ];
    this.createLine( this.handles[0], this.handles[1] );
    this.createLine( this.handles[1], this.handles[2] );
    this.createLine( this.handles[2], this.handles[3] );
    this.createLine( this.handles[3], this.handles[0] );

    this.canvas.on('object:moving', function(e) {
      var handle = e.target;
      this.updateLines( handle );
    }.bind(this));

    this.canvas.on('mouse:up', function(e) {
      this.emit('update');
    }.bind(this));
  },

  updatePosition: function() {
    var imagePosition = $(this.imageElement).position();
    var imageSize = $(this.imageElement).width();
    $('#imageOverlayWrap').css({
      position: 'absolute',
      top: imagePosition.top,
      left: imagePosition.left
    });
    this.canvas.setDimensions({
      width: $(this.imageElement).width(),
      height: $(this.imageElement).height()
    });
    this.canvas.calcOffset();
  },

  createLine: function (obj1, obj2) {
    var p1 = obj1.getCenterPoint();
    var p2 = obj2.getCenterPoint();
    var line = new fabric.Line([ p1.x, p1.y, p2.x, p2.y], {
      fill: 'red',
      stroke: 'red',
      strokeWidth: 1,
      selectable: false
    });
    obj1.fromLine = line;
    obj2.toLine = line;
    this.canvas.add( line );
    return line;
  },

  createDragHandle: function (x,y) {
    var handle = new fabric.Circle({
      radius: 5,
      fill: '#f55',
      hasControls: false,
      hasBorders: false
    });
    var point = new fabric.Point(x,y);
    handle.setPositionByOrigin(point, 'center', 'center');
    this.canvas.add( handle );
    return handle;
  },

  on: function(event, callback) {
    this.callbacks[ event ] = this.callbacks[ event ] || [];
    this.callbacks[ event ].push( callback );
  },

  emit: function(event) {
    if (this.callbacks[event]) {
      for (var i=0;i<this.callbacks[event].length;i++) {
        this.callbacks[ event ][ i ].call( this );
      }
    }
  },

  position: function() {
    var position = [];
    for (var i=0;i<this.handles.length;i++) {
      var point = this.handles[i].getCenterPoint();
      position.push( [ point.x, point.y ] );
    }
    return position;
  },

  updateLines: function(handle) {
    var p = handle.getCenterPoint();
    handle.fromLine.set({ x1: p.x, y1: p.y });
    handle.toLine.set({ x2: p.x, y2: p.y });
  },

  setPosition: function(position) {
    for (var i=0;i<this.handles.length;i++) {
      if (position[i]) {
        var point = new fabric.Point( position[i][0], position[i][1] );
        this.handles[i].setPositionByOrigin( point, 'center', 'center' );
        this.handles[i].setCoords();        
        this.updateLines( this.handles[i] );
      }
    }
    this.canvas.renderAll();
  }

};