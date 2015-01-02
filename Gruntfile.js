/*!
* Grunt file
*/

/*jshint node:true */
module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-nodeunit' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-jscs' );

	grunt.initConfig( {
		jshint: {
			options: {
				jshintrc: true
			},
			all: [ '*.js', '{src,tests}/*.js' ]
		},
		jscs: {
			src: '<%= jshint.all %>'
		},
		nodeunit: {
			options: {
				reporter: 'verbose'
			},
			all: 'tests/tests.js'
		},
		watch: {
			files: [ '<%= jshint.all %>', '.{jshintrc,jshintignore}', 'tests/*.json' ],
			tasks: 'test'
		}
	} );

	grunt.registerTask( 'test', [ 'jshint', 'jscs', 'nodeunit' ] );
	grunt.registerTask( 'default', 'test' );
};
