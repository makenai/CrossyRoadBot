/**
 * MJPEG Streamer - creates a handler that will stream jpeg data. Expects an event
 * emitter and an event name. When the event is triggered, it expects one argument,
 * which is the image, which has a toBuffer() method.
 *
 * Got lots of great reference materials here:
 *
 * http://stackoverflow.com/questions/25845219/c-opencv-streaming-camera-video-images-mjpeg-from-socket-into-browser-windo
 * https://github.com/psanford/node-mjpeg-test-server
 * http://nakkaya.com/2011/03/23/streaming-opencv-video-over-the-network-using-mjpeg/
 *
 *  @param {EventEmitter} eventEmitter
 *  @param {String} eventName
 *  @return {function} handler(req,res)
 */
function MJPEGStreamer( eventEmitter, eventName ) {
  return function(req, res) {

    // MJPEG header
    res.writeHead(200, {
      'Content-Type': 'multipart/x-mixed-replace; boundary=next',
      'Cache-Control': 'no-cache',
      'Connection': 'close',
      'Pragma': 'no-cache'
    });

    // Send an image every time we get the requested event
    var sendImage = function(image) {
      res.write("--next\r\n");
      res.write("Content-Type: image/jpeg\r\n");
      res.write("Content-Length: " + image.length + "\r\n");
      res.write("\r\n");
      res.write(image.toBuffer(), 'binary');
      res.write("\r\n");
    };
    eventEmitter.on( eventName, sendImage );

    // When the client disconnects, unsubscribe from the event emitter.
    res.connection.on('close', function() {
      eventEmitter.removeListener(eventName, sendImage);
    });

  };
}

module.exports = MJPEGStreamer;