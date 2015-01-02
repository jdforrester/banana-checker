banana-checker
==============

> Node task to check use of the "Banana" JSON i18n system provided by MediaWiki and jquery.i18n.

Quick start
-----------

Syntax: `node banana-checker.js [<path_to_configuration.json>]`

Configuration options
---------------------

* `path`
The path to the folder in which the i18n JSON files are stored, relative to the execution path. All files in this directory are considered translation files, except for the `sourceFile` and the `documentationFile`. Defaults to '`./i18n`'.
* `sourceFile`
The filename of the source message file from which all other files are translated, relative to the
`path`. Defaults to '`en.json`'.
* `documentationFile`
The filename of the description message file, relative to the `path`. Defaults to '`qqq.json`'.
* `flags`
A map of boolean settings to alter behaviour.
	* `flags.requireSourceMetadata`
	Error if the `sourceFile` does not have a metadata block defined. Defaults to '`true`'.
	* `flags.requireDocumentationMetadata`
	Error if the `documentationFile` does not have a metadata block defined. Defaults to '`true`'.
	* `flags.requireDocumentationComplete`
	Error if the `documentationFile` does not have an entry for each message in the `sourceFile`. Defaults to '`true`'.
	* `flags.requireDocumentationNotBlank`
	Error if the `documentationFile` has a blank or whitespace only entry for any message in the `sourceFile`. Defaults to '`true`'.
	* `flags.requireDocumentationNoExtras`
	Error if the `documentationFile` has an entry for a message not in the `sourceFile`. Defaults to '`true`'.
	* `flags.requireTranslationsMetadata`
	Error if any of translation files do not have a metadata block defined. Defaults to '`true`'.
	* `flags.requireTranslationsNoExtras`
	Error if any of translation files do not have an entry for a message not in the `sourceFile`. Defaults to '`false`'.
	* `flags.requireTranslationsNoDuplicates`
	Error if any of translation files have a entry for a message which is identical to the source message as defined in the `sourceFile`. Defaults to '`false`'.
	* `flags.requireTranslationsComplete`
	Error if any of translation files do not have an entry for each message in the `sourceFile`. Defaults to '`false`'.
	* `flags.provideSourceReport`
	Print out a report about the contents of the `sourceFile`. Defaults to '`false`'.
	* `flags.provideDocumentationReport`
	Print out a report about the contents of the `documentationFile`. Defaults to '`false`'.
	* `flags.provideTranslationsReport`
	Print out a report about the translation files. Defaults to '`false`'.
	* `flags.provideTranslationsCompletenessReport`
	Print out a report about the number of missing translations for each of the translation files. Defaults to '`false`'.
	* `flags.provideOverallReport`
	Print out an overall status report at the end of the run. Defaults to '`true`'.


Versioning
----------

We use the Semantic Versioning guidelines as much as possible.

Releases will be numbered in the following format:

`<major>.<minor>.<patch>`

For more information on SemVer, please visit http://semver.org/.


Issue tracker
-------------

Found a bug or missing feature? Please report it in the [issue tracker](https://github.com/jdforrester/banana-checker)!


Release
----------

Release process:
<pre lang="bash">
$ cd path/to/banana-checker/
$ git remote update
$ git checkout -b release -t origin/master

# Ensure tests pass
$ npm install && npm test

# Avoid using "npm version patch" because that creates
# both a commit and a tag, and we shouldn't tag until after
# the commit is merged.

# Update release notes
# Copy the resulting list into a new section on History.md
$ git log --format='* %s (%aN)' --no-merges --reverse v$(node -e 'console.log(require("./package.json").version);')...HEAD | grep -v "Localisation updates from"
$ edit History.md

# Update the version number
$ edit package.json

$ git add -p
$ git commit -m "Tag vX.X.X"
$ git review

# After merging:
$ git remote update
$ git checkout origin/master
$ git tag "vX.X.X"
$ git push --tags
$ npm publish
</pre>
