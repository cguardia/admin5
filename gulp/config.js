var
  src = './src',
  build = './build',
  dist = './dist';

module.exports = {
  browserSync: {
    dev: {
      server: {
        baseDir: [build],
        directory: true
      },
      open: false,
      files: [
        build + '/**',
        // Exclude Map files
        '!' + build + '/**.map'
      ]
    }
  },
  html: {
    src: [
      src + '/*.html',
      src + '/*.css'
    ],
    base: './src',
    build: build
  },
  browserify: {
    // Enable source maps
    debug: true,
    // A separate bundle will be generated for each
    // bundle config in the list below
    bundleConfigs: [{
      entries: src + '/module.js',
      dest: build,
      outputName: 'admin5.js'
    }]
  },
  dist: {
    src: [build + '/*'],
    dest: dist
  }
};
