var chalk = require('chalk');
var _ = require('lodash');

var LEVEL = {
	INFO: chalk.white,
	OK: chalk.bold.white,
	WARN: chalk.yellow,
	ERROR: chalk.bgRed.bold.black,
	DEBUG: chalk.bgBlack.green
};

var GLYPHS = {
	OK: '✓',
	ERROR: '✗',
	INFO: '⁃'
};

module.exports = new Log();

function Log() {}
Log.prototype.log = function log(levelKey, message) {
	var msgPrefix = '';
	var format = LEVEL[levelKey];

	switch (levelKey) {
		case 'ERROR':
			msgPrefix = chalk.red(GLYPHS.ERROR) + ' ';
			break;
		case 'OK':
			msgPrefix = chalk.green(GLYPHS.OK) + ' ';
			break;
		default:
			msgPrefix = chalk.bold.white(GLYPHS.INFO) + ' ';
			break;
	}

	return console.log(msgPrefix + format(message));
};

var funcs = _.reduce(LEVEL, function reduce(newFuncs, levelVal, levelKey) {
	newFuncs[levelKey.toLowerCase()] = _.partial(Log.prototype.log, levelKey);
	return newFuncs;
}, {});
_.extend(Log.prototype, funcs);
