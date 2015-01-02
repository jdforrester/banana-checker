/*!
* Command line banana-checker v0.1.0
*
* A node checker for the 'banana' format JSON i18n message files.
*
* Copyright 2014-2015 James D. Forrester and other contributors.
* Released under the MIT license
* http://mit-license.org
*
* Date: 2015-01-02
*/
'use strict';
// Set up from configuration object.
if ( process.argv.length > 3 ) {
	console.error( 'Syntax: node banana-checker.js [<path_to_configuration.json>]' );
	process.exit( 1 );
}

var configurationInput, configuration,

	configurationFile = '.',

	banana = require( './banana-checker' ),

	/* jscs: disable disallowDanglingUnderscores */
	extend = require( 'util' )._extend,
	/* jscs: enable disallowDanglingUnderscores */

	path = require( 'path' );

if ( !process.argv[2] ) {
	configurationInput = {};
} else {
	try {
		configurationFile = path.resolve( process.argv[2] );
		configurationInput = require( configurationFile );
	} catch ( e ) {
		console.error( 'Fatal error: reading the configuration file failed.\nDetails: ', e );
		process.exit( 1 );
	}
}

// FIXME: This should be done using a recursing extend function.
configuration = extend( Object.create( banana.defaults ), configurationInput );
configuration.flags = extend( Object.create( banana.defaults.flags ), configurationInput.flags );

configuration.path = path.resolve( path.dirname( configurationFile ), configuration.path );

banana.lint( configuration, function ( e, response ) {
	if ( e ) {
		console.error( e + '\n\nCurrent directory: ' + process.cwd() );
		process.exit( 1 );
	}

	var key, issue;

	for ( key in response.files ) {
		console.warn( '\n' + key + ':' );
		for ( issue in response.files[key] ) {
			if ( response.files[key][issue].verbosity > 1 ) {
				console.log( '\t' + response.files[key][issue].message );
			} else {
				console.warn( response.files[key][issue].message );
			}
		}
	}

	for ( key in response.reports ) {
		console.log( key + ': ' + response.reports[key] );
	}

	if ( Object.keys( response.files ).length ) {
		process.exit( 1 );
	}
	process.exit( 0 );
} );
