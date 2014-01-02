module.exports = function (grunt) {
    grunt.initConfig(
        {
            pkg: grunt.file.readJSON('package.json'),
            meta: {
                banner: '/*!\n* <%= pkg.name %> - v<%= pkg.version %>\n' +
                    '* http://www.sampleproject.com/\n' +
                    '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
                    'OSF\n*/\n\n'
            },

            // The clean task ensures the parsed css is removed
            clean: ["admin5/lib"],

            concat: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                css: {
                    files: [
                        {
                            src: [
                                'bower_components/bootstrap/dist/css/bootstrap.css',
                                'bower_components/bootstrap/dist/css/bootstrap-theme.css',
                                'bower_components/select2/select2.css'],
                            dest: 'admin5/lib/admin5_lib.css'
                        }
                    ]
                },
                js: {
                    files: [
                        {
                            src: [
                                'bower_components/jquery/jquery.min.js',
                                'bower_components/angular/angular.js'
                            ],
                            dest: 'admin5/lib/admin5_lib.js'
                        }
                    ]
                }
            },

            copy: {
                main: {
                    files: [
                        {
                            expand: true,
                            cwd: 'bower_components',
                            src: [
                                'bootstrap/dist/fonts/*'
                            ],
                            flatten: true,
                            dest: 'admin5/lib/fonts/'
                        },
                        {
                            expand: true,
                            cwd: 'bower_components/select2',
                            src: [
                                '*.png',
                                '*.gif'
                            ],
                            flatten: true,
                            dest: 'admin5/lib'

                        }

                    ]
                }
            }
        });

    // Load tasks so we can use them
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-clean");

    // The dev task will be used during development
    grunt.registerTask("default", ["clean", "concat", "copy"]);
};
