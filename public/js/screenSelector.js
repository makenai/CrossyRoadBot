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

  destroy: function() {
    $(this.wrapper).remove();
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
      this.createDragHandle(10,10, 'green'),
      this.createDragHandle(100,10),
      this.createDragHandle(100,100),
      this.createDragHandle(10,100)
    ];
    this.createLine( this.handles[0], this.handles[1], 'yellow' );
    this.createLine( this.handles[1], this.handles[2] );
    this.createLine( this.handles[2], this.handles[3] );
    this.createLine( this.handles[3], this.handles[0] );

    this.canvas.on('object:moving', function(e) {
      var handle = e.target;
      this.updateLines( handle );
    }.bind(this));

    this.canvas.on('mouse:up', function(e) {
      this.emit('update', this.position());
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

  createLine: function (obj1, obj2, color) {
    var p1 = obj1.getCenterPoint();
    var p2 = obj2.getCenterPoint();
    var line = new fabric.Line([ p1.x, p1.y, p2.x, p2.y], {
      fill: color || 'red',
      stroke: color || 'red',
      strokeWidth: 1,
      selectable: false
    });
    obj1.fromLine = line;
    obj2.toLine = line;
    this.canvas.add( line );
    return line;
  },

  createDragHandle: function (x,y,color) {
    var handle = new fabric.Circle({
      radius: 5,
      fill: color || '#f55',
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

  emit: function(event, args) {
    if (this.callbacks[event]) {
      for (var i=0;i<this.callbacks[event].length;i++) {
        this.callbacks[ event ][ i ].call( this, args );
      }
    }
  },

  naturalScale: function(point) {
    return [
      Math.round(point[0] * (this.imageElement.naturalWidth / this.imageElement.width)),
      Math.round(point[1] * (this.imageElement.naturalHeight / this.imageElement.height))
    ];
  },

  visualScale: function(point) {
    return [
      Math.round(point[0] * (this.imageElement.width / this.imageElement.naturalWidth)),
      Math.round(point[1] * (this.imageElement.height / this.imageElement.naturalHeight))
    ];
  },

  position: function() {
    var position = [];
    for (var i=0;i<this.handles.length;i++) {
      var point = this.handles[i].getCenterPoint();
      var natural = this.naturalScale([ point.x, point.y ]);
      position.push( natural );
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
        var visual = this.visualScale( position[i] );
        var point = new fabric.Point( visual[0], visual[1] );
        this.handles[i].setPositionByOrigin( point, 'center', 'center' );
        this.handles[i].setCoords();
        this.updateLines( this.handles[i] );
      }
    }
    this.emit('update', this.position());
    this.canvas.renderAll();
  }

};