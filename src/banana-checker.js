/*!
* banana-checker v0.1.0
*
* A library to check for the 'banana' format JSON i18n message files.
*
* Copyright 2014-2015 James D. Forrester and other contributors.
* Released under the MIT license
* http://mit-license.org
*
* Date: 2015-01-02
*/
'use strict';
module.exports = {
	defaults: {
		path: './i18n',
		sourceFile: 'en.json',
		documentationFile: 'qqq.json',
		flags: {
			requireSourceMetadata: true,
			provideSourceReport: false,
			requireDocumentationMetadata: true,
			requireDocumentationComplete: true,
			requireDocumentationNotBlank: true,
			requireDocumentationNoExtras: true,
			provideDocumentationReport: false,
			requireTranslationsMetadata: true,
			requireTranslationsNoExtras: false,
			requireTranslationsNoDuplicates: false,
			requireTranslationsComplete: false,
			provideTranslationsReport: false,
			provideTranslationsCompletenessReport: false,
			provideOverallReport: true
		}
	},

	lint: function ( config, callback ) {
		var sourceMessages, documentationMessages, translatedMessages, temp, tempStack, key,
			response = {
				files: {},
				reports: {}
			};

		function plural( count, pluralForm, singularForm ) {
			return ( count === 1 ) ? ( singularForm || '' ) : ( pluralForm || 's' );
		}

		function verifyAndStripMetadata( keys, flag ) {
			var temp = keys.hasOwnProperty( '@metadata' );

			if ( temp !== -1 ) {
				delete keys[ '@metadata' ];
			} else {
				if ( flag ) {
					return { keys: keys, error: 'File lacks a metadata block.' };
				}
			}
			return { keys: keys };
		}

		function keysMatch( firstArray, secondArray ) {
			var temp,
				tempStack = [];

			for ( temp in firstArray ) {
				if ( !secondArray.hasOwnProperty( temp ) ) {
					tempStack.push( temp );
				}
			}

			return { missing: tempStack };
		}

		function valuesDiffer( firstArray, secondArray ) {
			var temp,
				tempStack = [];

			for ( temp in firstArray ) {
				if (
					( secondArray.hasOwnProperty( temp ) ) &&
					( secondArray[temp] === firstArray[temp] )
				) {
					tempStack.push( temp );
				}
			}

			return { matches: tempStack };
		}

		function valuesNotBlank( array ) {
			var temp,
				tempStack = [];

			for ( temp in array ) {
				if ( array[ temp ].trim( ) === '' ) {
					tempStack.push( temp );
				}
			}

			return { blanks: tempStack };
		}

		function writeLog( file, message, verbosity ) {
			var accessor = response.files[file] || ( response.files[file] = [] );
			accessor.push( { message: message, verbosity: verbosity || 0 } );
		}

		// Validate that each of the JSON files are valid, and have metadata blocks (as needed).
		try {
			sourceMessages = require( config.path + '/' + config.sourceFile );
		} catch ( e ) {
			callback(
				new Error( 'Reading the source messages file failed.\nDetails: ' + e ),
				response
			);
			return;
		}
		temp = verifyAndStripMetadata(
			sourceMessages,
			config.flags.requireSourceMetadata
		);
		if ( temp.error ) {
			writeLog(
				config.sourceFile,
				'Source messages file lacks a metadata block.'
			);
		}

		try {
			documentationMessages = require( config.path + '/' + config.documentationFile );
		} catch ( e ) {
			callback(
				new Error( 'Reading the documentation messages file failed.\nDetails: ' + e ),
				response
			);
			return;
		}
		temp = verifyAndStripMetadata(
			documentationMessages,
			config.flags.requireDocumentationMetadata
		);
		if ( temp.error ) {
			writeLog(
				config.documentationFile,
				'Documentation file lacks a metadata block.'
			);
		}

		try {
			tempStack = require( 'fs' ).readdirSync( config.path );
		} catch ( e ) {
			callback(
				new Error( 'Reading the translated messages directory failed.\nDetails: ' + e ),
				response
			);
			return;
		}
		temp = tempStack.indexOf( config.sourceFile );
		if ( temp !== -1 ) {
			tempStack.splice( temp, 1 );
		}
		temp = tempStack.indexOf( config.documentationFile );
		if ( temp !== -1 ) {
			tempStack.splice( temp, 1 );
		}

		translatedMessages = {};
		for ( temp in tempStack ) {
			try {
				translatedMessages[ tempStack[temp] ] = require( config.path + '/' + tempStack[temp] );
			} catch ( e ) {
				callback(
					new Error( 'Reading the translated messages file ' + tempStack[temp] +
						' failed.\nDetails: ' + e ),
					response
				);
				return;
			}

			temp = verifyAndStripMetadata(
				translatedMessages[ tempStack[ temp ] ],
				config.flags.requireTranslationsMetadata
			);
			if ( temp.error ) {
				writeLog(
					tempStack[ temp ],
					'Translated messages file lacks a metadata block.' );
			}
		}

		// Does each message in the master language have a documentation message?
		if ( config.flags.requireDocumentationComplete ) {
			tempStack = keysMatch( sourceMessages, documentationMessages );
			temp = tempStack.missing.length;
			if ( temp ) {
				writeLog(
					config.documentationFile,
					temp + ' message' + plural( temp, 's lack', ' lacks' ) + ' documentation.'
				);
				tempStack.missing.forEach( function ( message ) {
					writeLog(
						config.documentationFile,
						'Message \'' + message + '\' lacks documentation.',
						1
					);
				} );
			}
		}

		// Does each message in the documentation match to an entry in the master language?
		if ( config.flags.requireDocumentationNoExtras ) {
			tempStack = keysMatch( documentationMessages, sourceMessages );
			temp = tempStack.missing.length;
			if ( temp ) {
				writeLog(
					config.documentationFile,
					temp + ' documented message' + plural( temp, 's are', ' is' ) +
						' undefined.'
				);
				tempStack.missing.forEach( function ( message ) {
					writeLog(
						config.documentationFile,
						'Message \'' + message + '\' is documented but undefined.',
						1
					);
				} );
			}
		}

		// Does each documented message in the master language have a non-blank documentation message?
		if ( config.flags.requireDocumentationNotBlank ) {
			tempStack = valuesNotBlank( documentationMessages );
			temp = tempStack.blanks.length;
			if ( temp ) {
				writeLog(
					config.documentationFile,
					temp + ' documented message' + plural( temp, 's are', ' is' ) +
						' blank.'
				);
				tempStack.blanks.forEach( function ( message ) {
					writeLog(
						config.documentationFile,
						'Message \'' + message + '\' is documented with a blank string.',
						1
					);
				} );
			}
		}

		// Does each message in the master language match to an entry in each of the non-master languages? #7
		if ( config.flags.requireTranslationsComplete ) {
			for ( key in translatedMessages ) {
				tempStack = keysMatch( sourceMessages, translatedMessages[key] );
				temp = tempStack.missing.length;
				if ( temp ) {
					writeLog(
						key,
						temp + ' message' + plural( temp, 's lack', ' lacks' ) +
							'  translation in \'' + key + '\'.'
					);
					tempStack.missing.forEach( function ( message ) {
						writeLog(
							key,
							'Message \'' + message + '\' is untranslated in \'' + key + '\'.',
							1
						);
					} );
				}
			}
		}

		// Does each message in each of the non-master languages match to an entry in the master language? #3
		if ( config.flags.requireTranslationsNoExtras ) {
			for ( key in translatedMessages ) {
				tempStack = keysMatch( translatedMessages[key], sourceMessages );
				temp = tempStack.missing.length;
				if ( temp ) {
					writeLog(
						key,
						temp + ' extra message' + plural( temp, 's are', ' is' ) +
							' provided in \'' + key + '\'.'
					);
					tempStack.missing.forEach( function ( message ) {
						writeLog(
							key,
							'Extra message \'' + message + '\' is present in \'' + key + '\'.',
							1
						);
					} );
				}
			}
		}

		// Is each translated message distinct from the corresponding entry in the master language? #4
		if ( config.flags.requireTranslationsNoDuplicates ) {
			for ( key in translatedMessages ) {
				tempStack = valuesDiffer( translatedMessages[key], sourceMessages );
				temp = tempStack.matches.length;
				if ( temp ) {
					writeLog(
						key,
						temp + ' message' + plural( temp, 's are', ' is' ) +
							' identical in \'' + key + '\'.'
					);
					tempStack.matches.forEach( function ( message ) {
						writeLog(
							key,
							'Extra message \'' + message + '\' is identical in \'' + key + '\'.',
							1
						);
					} );
				}
			}
		}

		// Report on files and activity
		if ( config.flags.provideSourceReport ) {
			temp = Object.keys( sourceMessages ).length;
			response.reports.source = temp + ' message' + plural( temp ) + ' present.';
		}

		if ( config.flags.provideDocumentationReport ) {
			temp = Object.keys( documentationMessages ).length;
			response.reports.documentation = temp + ' documentation message' +
				plural( temp ) + ' present.';
		}

		if ( config.flags.provideTranslationsReport ) {
			temp = Object.keys( translatedMessages ).length;
			response.reports.translations = temp + ' translated set' + plural( temp ) +
				' of messages present.';
		}

		if ( config.flags.provideTranslationsCompletenessReport ) {
			tempStack = [];

			for ( key in translatedMessages ) {
				for ( temp in sourceMessages ) {
					if ( !translatedMessages[key].hasOwnProperty( temp ) ) {
						if ( !tempStack.hasOwnProperty( key ) ) {
							tempStack[key] = [];
						}
						tempStack[key].push( sourceMessages[temp] );
					}
				}
			}

			temp = Object.keys( translatedMessages ).length;
			response.reports.translationCompleteness = temp + ' set' + plural( temp ) +
				' of translations of ';

			temp = Object.keys( sourceMessages ).length;
			response.reports.translationCompleteness += temp + ' message' + plural( temp );

			temp = Object.keys( tempStack ).length;
			if ( temp ) {
				response.reports.translationCompleteness += ' with missing translations in ' +
					temp + ' language' + plural( temp ) + ':\n';

				for ( key in tempStack ) {
					temp = tempStack[key].length;
					response.reports.translationCompleteness += '\tLanguage \'' + key + '\'' +
						' is missing ' + temp + ' message' + plural( temp ) +
						' (' + ( Math.round( 100 * ( temp / Object.keys( sourceMessages ).length ) ) ) + '%).\n';
				}
			} else {
				response.reports.translationCompleteness += ', completely.';
			}
		}

		if ( config.flags.provideOverallReport ) {

			temp = Object.keys( sourceMessages ).length;
			response.reports.overall = temp + ' message' + plural( temp ) + ' checked against ';
			temp = Object.keys( documentationMessages ).length;
			response.reports.overall += temp + ' documentation message' + plural( temp ) + ' and ';
			temp = Object.keys( translatedMessages ).length;
			response.reports.overall += temp +	' set' + plural( temp ) + ' of translations';

			temp = 0;
			for ( key in response.files ) {
				temp += response.files[key].length;
			}
			if ( temp > 0 ) {
				response.reports.overall += ' with ' + temp + ' error' + plural( temp ) + '.';
			} else {
				response.reports.overall += ' without error.';
			}
		}

		callback( null, response );
		return;
	}

};
