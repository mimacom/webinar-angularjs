/**
 * Created by jalo on 12/05/2014.
 */
module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        temp_dir: 'temp', /** temp folder **/
        build_dir: 'build', /** development **/
        compile_dir: 'dist', /** production **/

        app_files: {
            js: [
                'app/js/core/*.js',
                'app/js/components/*.js',
                'app/js/welcome/*.js',
                'app/js/signup/signupModule.js',
                'app/js/signup/signupService.js',
                'app/js/signup/signupCtrl.js',
                'app/js/app.js'
            ],
            jsunit: [
                'test/lib/*.js',
                'test/unit/**/*.js'
            ],
            tpl: [ 'app/views/**/*.html' ]
        },

        /**
         * The directories to delete when `grunt clean` is executed.
         */
        clean:{
            options: {
                // 'no-write': true,
                'force': true
            },
            tempDirs:  [
                '<%= temp_dir %>',
                '<%= build_dir %>',
                '<%= compile_dir %>'
            ]
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            dist: {
                src: '<%= concat.compile_js.dest %>',
                dest: '<%= compile_dir %>/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },

        /**
         * The Karma configurations.
         */
        karma: {
            options: {
                configFile: 'test/karma.conf.js'
            },
            watch: {
                autoWatch: true
            },
            singleRun: {
                singleRun: true
            }
        },

        /**
         * HTML2JS is a Grunt plugin that takes all of your template files and
         * places them into JavaScript files as strings that are added to
         * AngularJS's template cache. This means that the templates too become
         * part of the initial payload as one JavaScript file. Neat!
         */
        html2js: {
            app: {
                src: [ '<%= app_files.tpl %>' ],
                dest: '<%= temp_dir %>/templates-app.js'
            }
        },

        /**
         * `grunt concat` concatenates multiple source files into a single file.
         */
        concat: {
            /**
             * The `compile_js` target is the concatenation of our application source
             * code and all specified vendor source code into a single file.
             */
            compile_js: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                },
                src: [
                    //'<%= vendor_files.js %>',
                    '<%= html2js.app.dest %>',
                    //'module.prefix',
                    '<%= app_files.js %>',
                    //'module.suffix'
                ],
                dest: '<%= compile_dir %>/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-html2js');


    // Default task(s).
    grunt.registerTask('default', ['uglify']);

    //Test
    grunt.registerTask('test', ['karma:singleRun']);

    //Build
    grunt.registerTask('build', ['clean', 'html2js', 'concat']);

    grunt.registerTask('development', ['test', 'build']);
    grunt.registerTask('production', ['test', 'build', 'uglify']);

};
