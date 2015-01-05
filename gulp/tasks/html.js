var
  gulp = require('gulp'),
  config = require('../config').html;

gulp.task('html', function () {
  return gulp.src(config.src, {base: config.base})
    .pipe(gulp.dest(config.dest));
});