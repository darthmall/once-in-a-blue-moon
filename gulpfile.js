var del = require('del');
var gulp = require('gulp');
var webpack = require('webpack');

var WebpackDevServer = require('webpack-dev-server');

var $ = require('gulp-load-plugins')();

var config = require('./webpack.config.js');

gulp.task('js', function (cb) {
  webpack(config, function (err, stats) {
    if(err) throw new gutil.PluginError("webpack", err);
    $.util.log("[webpack]", stats.toString({
      colors: true
    }));
    cb();
  });
});

gulp.task('html', function () {
  gulp.src('./src/*.html')
    .pipe(gulp.dest('./build'));
});

gulp.task('static', function () {
  gulp.src('./data/*')
    .pipe(gulp.dest('./build/data'));
});

gulp.task('css', function () {
  gulp.src('./src/css/*.css')
    .pipe(gulp.dest('./build/css'));
});

gulp.task('clean', function (cb) {
  del(['build']).then(function () {
    cb()
  });
});

gulp.task('build', ['static', 'html', 'css', 'js']);

gulp.task('dev', ['static', 'html', 'css'], function () {
  gulp.watch('src/css/*.css', ['css']);
  gulp.watch('src/*.html', ['html']);
  gulp.watch('data/*', ['static']);

  // Start a webpack-dev-server
  var compiler = webpack(config);

  var server = new WebpackDevServer(compiler, {
    contentBase: './build'
  }).listen(8080, "localhost", function(err) {
    if(err) throw new gutil.PluginError("webpack-dev-server", err);
    // Server listening
    $.util.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html");
  });
});
