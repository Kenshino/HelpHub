/* jshint node:true */
/* global module */
module.exports = function( grunt ) {
	var HH_CSS = [
			'plugins/support-helphub/inc/helphub-*/assets/css/*.css',
			'plugins/support-helphub/inc/table-of-contents-lite/assets/css/*.css',
			'plugins/helphub-contributors/public/css/helphub-contributors-public.css'
		],

		HH_SCSS = [
			'plugins/**/*.scss',
			'themes/wporg-support/**/*.scss',
			'!themes/wporg-support/node_modules/**/*.scss',
			'!themes/wporg-support/sass/_normalize.scss',
			'!themes/wporg-support/sass/mixins/_breakpoint.scss',
			'!themes/wporg-support/sass/mixins/_modular-scale.scss'
		],

		HH_JS = [
			'plugins/helphub-*/**/*.js',
			'themes/helphub/js/*.js'
		],

		autoprefixer = require('autoprefixer'),

		matchdep = require('matchdep'),

		nodeSass =  require('node-sass');

	// Load tasks.
	matchdep.filterDev('grunt-*').forEach( grunt.loadNpmTasks );

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON( 'package.json' ),
		checktextdomain: {
			options: {
				text_domain: 'wporg-forums',
				correct_domain: false,
				keywords: [
					'__:1,2d',
					'_e:1,2d',
					'_x:1,2c,3d',
					'_n:1,2,4d',
					'_ex:1,2c,3d',
					'_nx:1,2,4c,5d',
					'esc_attr__:1,2d',
					'esc_attr_e:1,2d',
					'esc_attr_x:1,2c,3d',
					'esc_html__:1,2d',
					'esc_html_e:1,2d',
					'esc_html_x:1,2c,3d',
					'_n_noop:1,2,3d',
					'_nx_noop:1,2,3c,4d'
				]
			},
			files: {
				src: [
					'plugins/support-helphub/**/*.php',
					'!plugins/support-helphub/inc/syntaxhighlighter/**/*.php',
					'themes/helphub/**/*.php'
				],
				expand: true
			}
		},
		checkDependencies: {
			options: {
				packageManager: 'npm'
			},
			src: {}
		},
		jscs: {
			src: HH_JS,
			options: {
				config: '.jscsrc',
				fix: false // Autofix code style violations when possible.
			}
		},
		jshint: {
			options: grunt.file.readJSON( '.jshintrc' ),
			grunt: {
				src: [ 'Gruntfile.js' ]
			},
			core: {
				expand: true,
				src: HH_JS
			}
		},
		jsvalidate:{
			options:{
				globals: {},
				esprimaOptions:{},
				verbose: false
			},
			files: {
				src: HH_JS
			}
		},
		postcss: {
			options: {
				map: false,
				processors: [
					autoprefixer({
						browsers: [ 'extends @wordpress/browserslist-config' ],
						cascade: false
					})
				],
				failOnError: false
			},
			helphub: {
				expand: true,
				src: 'themes/wporg-support/style.css'
			},
			contributors: {
				expand: true,
				src: 'plugins/support-helphub/inc/helphub-contributors/public/css/helphub-contributors-public.css'
			}
		},
		sass: {
			helphub: {
				expand: true,
				ext: '.css',
				cwd: 'themes/wporg-support/sass/',
				dest: 'themes/wporg-support/',
				src: [ 'style.scss' ],
				options: {
					implementation: nodeSass,
					indentType: 'tab',
					indentWidth: 1,
					outputStyle: 'expanded'
				}
			},
			contributors: {
				expand: true,
				ext: '.css',
				cwd: 'plugins/support-helphub/inc/helphub-contributors/src/sass/',
				dest: 'plugins/support-helphub/inc/helphub-contributors/public/css/',
				src: [ 'helphub-contributors-public.scss' ],
				options: {
					implementation: nodeSass,
					indentType: 'tab',
					indentWidth: 1,
					outputStyle: 'expanded'
				}
			}
		},
		stylelint: {
			css: {
				expand: true,
				src: HH_CSS
			},

			scss: {
				options: {
					syntax: 'scss'
				},
				expand: true,
				src: HH_SCSS
			}
		},
		watch: {
			config: {
				files: 'Gruntfile.js'
			},
			sass: {
				files: HH_SCSS,
				tasks: [ 'sass', 'postcss:helphub', 'postcss:contributors' ]
			}
		}
	});

	// CSS test task.
	grunt.registerTask( 'csstest', 'Runs all CSS tasks.', [ 'stylelint' ] );

	// JavaScript test task.
	grunt.registerTask( 'jstest', 'Runs all JavaScript tasks.', [ 'jsvalidate', 'jshint', 'jscs' ] );

	// PHP test task.
	grunt.registerTask( 'phptest', 'Runs all PHP tasks.', [ 'checktextdomain' ] );

	// Travis CI Task
	grunt.registerTask( 'travis', 'Runs Travis CI tasks.',[ 'csstest', 'jstest', 'phptest' ] );

	// Default task.
	grunt.registerTask( 'default', [
		'checkDependencies',
		'csstest',
		'jstest',
		'phptest',
		'sass',
		'postcss'
	] );
};
