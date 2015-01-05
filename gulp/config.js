var
  src = './src',
  dest = './build';

module.exports = {
  browserSync: {
    dev: {
      server: {
        baseDir: [dest],
        directory: true
      },
      open: false,
      files: [
        dest + '/**',
        // Exclude Map files
        '!' + dest + '/**.map'
      ]
    }
  },
  html: {
    src: [
      src + '/*.html',
      src + '/*.css'
    ],
    base: './src',
    dest: dest
  },
  browserify: {
    // Enable source maps
    debug: true,
    // A separate bundle will be generated for each
    // bundle config in the list below
    bundleConfigs: [{
      entries: src + '/module.js',
      dest: dest,
      outputName: 'admin5.js'
    }]
  }
};
