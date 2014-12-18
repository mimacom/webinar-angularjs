/**
 * Created by jalo on 12/05/2014.
 */
module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);
    //grunt.loadNpmTasks('time-grunt');

    /**
     * Load required Grunt tasks. These are installed based on the versions listed
     * in `package.json` when you do `npm install` in this directory.
     */

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-html2js');


    // Project configuration.
    //noinspection JSUnresolvedFunction
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        temp_dir: 'temp', /** temp folder **/
        build_dir: 'dist', /** development **/
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

        vendor_files: {
            js: [
                'bower_components/underscore/underscore-min.js',
                'bower_components/jquery/jquery.js',
                'bower_components/bootstrap-css/js/bootstrap.min.js',
                'bower_components/angular/angular.js',
                'bower_components/angular-route/angular-route.min.js',
                'lib/i18n/jquery.i18n.properties-1.0.9.js'
            ]
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
                dest: '<%= compile_dir %>/<%= pkg.name %>-<%= pkg.version %>.js'
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
                    '<%= vendor_files.js %>',
                    '<%= html2js.app.dest %>',
                    '<%= app_files.js %>'
                ],
                dest: '<%= compile_dir %>/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                '<%= app_files.js %>'
            ]
        },

        filesTemplate: {
            karmaUnit: {
                files: [
                    '<%= vendor_files.js %>',
                    'vendor/angular-mocks/angular-mocks.js',
                    '<%= html2js.app.dest %>',
                    '<%= html2js.common.dest %>',
                    '<%= app_files.js %>',
                    '<%= app_files.jsunit %>'
                ],
                src: 'tpls/karma.conf.tpl.js',
                dest: '<%= temp_dir %>/karma.conf.js'
            },
            jsFilesLoader: {
                files: [
                    '<%= vendor_files.js %>',
                    '<%= html2js.app.dest %>',
                    '<%= app_files.js %>'
                ],
                //transformFile: replacePrefix.bind(null, ['<%= build_dir %>/', '<%= temp_dir %>/'], '<%= webapp_context %>'),
                src: 'jsFilesLoader.tpl.js',
                dest: '<%= build_dir %>/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        }
    });

    // Default task(s).
    grunt.registerTask('default', ['build']);

    //Test
    grunt.registerTask('test', ['karma:singleRun']);

    //Analyze
    //grunt.registerTask('analyze', ['jshint']);

    //Build
    grunt.registerTask('build', ['clean', 'html2js', 'filesTemplate:jsFilesLoader']);

    grunt.registerTask('compile', ['clean', 'html2js', 'concat', 'uglify']);

    //Development
    grunt.registerTask('development', ['test', 'build']);

    //Production
    grunt.registerTask('production', ['test', 'compile']);


    /**
     *  In order to avoid having to specify manually the files needed for a file
     * (i.e. a karma file or a main.less or a files loader) we use grunt to manage
     *  the list of files for us. Yay!
     */
    grunt.registerMultiTask( 'filesTemplate', 'Process a file templates that needs to dynamically add an array of files', function () {
        function identity (val){
            return val;
        }

        function transformFiles(files, transform){
            var transformedFiles = [];
            files.forEach(function(file){
                transformedFiles.push(transform(file));
            });
            return transformedFiles;
        }

        var data = this.data,
            transformFile = data.transformFile || identity,
            files = transformFiles(grunt.file.expand(data.files), transformFile),
            srcTemplate = data.src,
            destFile = data.dest;


        grunt.file.copy( srcTemplate, destFile, {
            process: function ( contents, path ) {
                return grunt.template.process( contents, {
                    data: {
                        files: files,
                        scripts: filterForJS(files),
                        styles: filterForCSS(files),

                    }
                });
            }
        });
    });

    /**
     * A utility function to get all app JavaScript sources.
     */
    function filterForJS ( files ) {
        return files.filter( function ( file ) {
            return file.match( /\.js$/ );
        });
    }

    /**
     * A utility function to get all app CSS sources.
     */
    function filterForCSS ( files ) {
        return files.filter( function ( file ) {
            return file.match( /\.css$/ );
        });
    }

    function replacePrefix(prefixes, newPrefix, str){
        prefixes = Array.isArray(prefixes) ? prefixes : [prefixes];
        prefixes.forEach(function(prefix){
            prefix = grunt.template.process(prefix);
            str = str.replace(prefix, '')
        });
        newPrefix = grunt.template.process(newPrefix);
        return newPrefix + str;
    }
};
