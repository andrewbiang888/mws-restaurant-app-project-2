module.exports = function(grunt) {

  grunt.initConfig({
    responsive_images: {
      dev: {
        options: {
          engine: 'im',
          sizes: [{
            rename: false,
            width: 300,
            suffix: '_1x',
            // quality: 30
          }, {
            rename: false,
            width: 600,
            suffix: '_2x',
            // quality: 30
          }]
        },
        files: [{
          expand: true,
          src: ['*.{gif,jpg,png}'],
          cwd: 'img/',
          dest: 'img/tiles/'
        }]
      },
      dev2: {
        options: {
          engine: 'im',
          sizes: [{
            rename: false,
            width: 500,
            suffix: '_1x',
            // quality: 30
          }, {
            rename: false,
            width: 800,
            suffix: '_2x',
            // quality: 30
          }]
        },
        files: [{
          expand: true,
          src: ['*.{gif,jpg,png}'],
          cwd: 'img/',
          dest: 'img/banners/'
        }]
      }
    },
    /* Clear out the img directory if it exists */
    clean: {
      dev: {
        src: ['img/tiles'],
      },
      dev2: {
        src: ['img/banners'],
      },
    },
    /* Generate the img directory if it is missing */
    mkdir: {
      dev: {
        options: {
          create: ['img/tiles']
        },
      },
      dev2: {
        options: {
          create: ['img/banners']
        },
      },
    },
  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.registerTask('default', ['responsive_images']);

};