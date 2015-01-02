var exec = require( 'child_process' ).exec;

exports.superBasic = function ( test ) {
	test.expect( 3 );

	exec( 'node ../src/banana-checker-cmd.js', { cwd: './tests' }, function ( err, stdOut, stdErr ) {
		test.equal( err, null, 'err should be null (uninterrupted exection)' );
		test.equal( stdErr, '', 'stdErr should be blank' );
		test.equal( stdOut, 'overall: 4 messages checked against 4 documentation messages and 2 sets of translations without error.\n', 'stdOut should be identical' );
		test.done();
	} );
};

exports.passingWithOptions = function ( test ) {
	test.expect( 3 );

	exec( 'node src/banana-checker-cmd.js tests/simple.json', function ( err, stdOut, stdErr ) {
		test.equal( err, null, 'err should be null (uninterrupted exection)' );
		test.equal( stdErr, '', 'stdErr should be blank' );
		test.equal( stdOut, 'translationCompleteness: 2 sets of translations of 4 messages, completely.\noverall: 4 messages checked against 4 documentation messages and 2 sets of translations without error.\n', 'stdOut should be identical' );
		test.done();
	} );
};

exports.tryToFail = function ( test ) {
	test.expect( 3 );

	exec( 'node src/banana-checker-cmd.js tests/failures.json', function ( err, stdOut, stdErr ) {
		test.equal( err && err.code, 1, 'err.code should be 1 (interrupted exection)' );
		test.equal( stdErr, '\ndocumentation.json:\n1 message lacks documentation.\nMessage \'second-message-ky\' lacks documentation.\n1 documented message is undefined.\nMessage \'second-message-key\' is documented but undefined.\n1 documented message is blank.\nMessage \'third-message-key\' is documented with a blank string.\n\ntranslations.json:\n4 messages are identical in \'translations.json\'.\nExtra message \'first-message-key\' is identical in \'translations.json\'.\nExtra message \'second-message-ky\' is identical in \'translations.json\'.\nExtra message \'third-message-key\' is identical in \'translations.json\'.\nExtra message \'four-message-key\' is identical in \'translations.json\'.\n', 'stdErr should list a specific set of 11 issues' );
		test.equal( stdOut, 'overall: 4 messages checked against 4 documentation messages and 1 set of translations with 11 errors.\n', 'stdOut should be identical, mentioning the 11 issues' );
		test.done();
	} );
};
