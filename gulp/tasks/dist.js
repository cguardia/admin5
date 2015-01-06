var
  gulp = require('gulp'),
  dist = require('../config').dist;

gulp.task('dist', function () {
  gulp.src(dist.src)
    .pipe(gulp.dest(dist.dest));
});