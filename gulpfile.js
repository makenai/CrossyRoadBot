var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var concat = require('gulp-concat');
var nodemon = require('gulp-nodemon');

gulp.task('browserify', function() {

    var bundler = browserify({
        entries: ['./client/main.jsx'],
        transform: [reactify],
        debug: true,
        cache: {},
        packageCache: {},
        fullPaths: true
    });
    var watcher  = watchify(bundler);

    watcher.on('update', function () {
        var updateStart = Date.now();
        console.log('Updating!');
        watcher.bundle()
          .pipe(source('main.js'))
          // This is where you add uglifying etc.
          .pipe(gulp.dest('./public/js/'));
        console.log('Updated!', (Date.now() - updateStart) + 'ms');
    })
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('./public/js/'));

    return watcher;
});

gulp.task('start', function () {
  nodemon({
    script: 'index.js',
    ext: 'js',
    ignore: ['public/**/*.js'],
    env: { 'NODE_ENV': 'development' }
  })
});

gulp.task('default', ['browserify', 'start']);