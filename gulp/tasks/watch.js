var
  gulp = require('gulp'),
  config = require('../config');

gulp.task('setWatch', function() {
  global.isWatching = true;
});

gulp.task('watch', ['setWatch', 'browserSync'], function () {
  gulp.watch(config.html.src, ['html']);
});
