var request = require('request-promise');
var spawn = require('child_process').spawn;
var Promise = require('bluebird');
var fs = require('fs');
var _ = require('lodash');
var os = require('os');
var inquirer = require('inquirer');
var sudo = require('sudo');
var dejsonp = require('dejsonp');
var digits = require('digits');

module.exports = function factory(options) {
	options = options || {};
	return new Hockey(options);
};

function Hockey(options) {
	if (options.vlcPath) {
		this.vlcPath = options.vlcPath;
	}
	if (options.FNJarPath) {
		this.FNJarPath = options.FNJarPath;
	}
	_.extend(this, {
		gameURLTemplate: _.template('http://live.nhle.com/GameData/GCScoreboard/<%=year%>-<%=month%>-<%=day%>.jsonp'),
		FNVersion: '2.3',
		FNDownload: 'https://dl.dropboxusercontent.com/u/91463/FuckNeulionV2.3.jar',
		OSType: null,
		vlcPath: null,
		FNJarPath: './FuckNeulionV2.3.jar',
		todaysGames: []
	});
}

Hockey.prototype._checkJava = function _checkJava(resolve, reject) {
	console.info('Checking for Java...');
	var java = spawn('java', ['-version']);
	var output = '';
	var onData = function onData(data) {
		output += data;
	};
	var onClose = function onClose(code) {
		if (code === 0) {
			resolve(output);
		} else {
			reject(code);
		}
	};
	java.stderr.on('data', onData);
	java.on('error', reject);
	java.on('close', onClose);
};

Hockey.prototype.checkJavaAsync = function checkJavaAsync() {
	return new Promise(this._checkJava);
};

Hockey.prototype._checkFN = function _checkFN(resolve, reject) {
	console.info('Checking for FuckNeulion...');
	var hasFN = fs.existsSync('./FuckNeulionV' + this.FNVersion + '.jar');
	if (hasFN) {
		console.info('Found FuckNeulion!');
		return resolve(true);
	}
	console.info('Could not find the proper version of FuckNeulion, attempting to download it...');
	request
	.get(this.FNDownload)
	.on('error', function (err) {
		console.error('Could not download FuckNeulion - ' + err);
		return reject();
	})
	.pipe(fs.createWriteStream('FuckNeulionV2.3.jar'))
	.then(function () {
		resolve(true);
		console.info('Downloaded FuckNeulionV2.3.jar!');
	});
};

Hockey.prototype.checkFNAsync = function checkFNAsync() {
	return new Promise(this._checkFN);
};

Hockey.prototype._findVLCPath = function _findVLCPath(resolve, reject) {
	var path;

	this.OSType = os.type();
	switch (this.OSType) {
		case 'Darwin':
			path = '/Users/ext.cnajewicz/Applications/VLC.app/Contents/MacOS';
			break;
		default:
			reject('Could not determind OS type.');
			break;
	}
	this.vlcPath = path;
	resolve(this.vlcPath);
};

Hockey.prototype.findVLCPathAsync = function findVLCPathAsync() {
	return new Promise(this._findVLCPath);
};

Hockey.prototype._pickGame = function _pickGame(args, resolve) {
	args = args || {};
	var pickGame = {
		type: 'list',
		name: 'selected_game',
		message: 'Pick a game',
		choices: []
	};
	var pickHomeAway = {
		type: 'list',
		name: 'homeOrAway',
		message: 'Home or away feed?',
		choices: ['Home', 'Away']
	};

	args.games.forEach(function forEach(game) {
		pickGame.choices.push({
			name: game.htn + ' ' + game.htcommon + '\tvs.\t' + game.atn + ' ' + game.atcommon + '\t' + game.bs,
			value: game.id
		});
	});

	inquirer.prompt([pickGame, pickHomeAway], resolve);
};

Hockey.prototype.pickGameAsync = function pickGameAsync(args) {
	args = args || {};
	return new Promise(_.partial(this._pickGame, args));
};

Hockey.prototype._launchFN = function _launchFN(args, resolve, reject) {
	args = args || {};
	if (!args.selected_game) {
		throw new Error('You did not select a game, there will be no hockey for you.');
	}
	var _error = '';
	var sudoOptions = {
		cachePassword: true,
		prompt: 'sudo password? (needed to run FuckNeulionV2):',
		spawnOptions: {
			env: process.env,
			cwd: process.cwd()
		}
	};
	var fn = sudo(['java', '-jar', this.FNJarPath, String(args.selected_game), args.homeOrAway], sudoOptions);

	fn.stderr.on('data', function (data) {
		if (!data || !data.toString) {
			return;
		}
		_error += data.toString();
	});
	fn.stderr.on('end', function () {
		if (_error && _error.length) {
			reject('Could not run FuckNeulionV2: ' + _error);
		}
	});
	fn.stdout.on('data', function (data) {
		if (!data) {
			return;
		}
		console.info(data.toString());
	});
		// fn.on('error', console.error);
		// fn.on('exit', console.info);
		// fn.on('close', console.info);
};

Hockey.prototype.launchFNAsync = function launchFNAsync(args) {
	return new Promise(_.bind(this._launchFN, this, args));
};

Hockey.prototype.launchVLC = function launchVLC(args) {
	args = args || {};
	if (!args.vlcPath) {
		throw new Error('Could not get VLC path for launching VLC');
	}
	var vlc = spawn('./VLC', [], {
		cwd: args.vlcPath,
		env: process.env
	});
	vlc.on('error', console.error);
	vlc.on('close', function onVLCClose(err) {
		console.info('close vlc', err);
	});
	vlc.on('exit', function onVLCExit(err) {
		console.info('vlc exit', err);
	});
	return vlc;
};

Hockey.prototype.getGameIDsAsync = function getGameIDsAsync(vlcPath) {
	var today = new Date();
	var dateData = {
		year: today.getFullYear(),
		month: digits(today.getMonth() + 1, 2),
		day: digits(today.getDate(), 2)
	};
	var	url = this.gameURLTemplate(dateData);

	function parseResponse(data) {
		function dejsonpPromise(resolve, reject) {
			dejsonp.guess(data, function (err, result) {
				if (err) {
					reject(err);
				}
				result.vlcPath = vlcPath;
				resolve(result);
			});
		}
		return new Promise(dejsonpPromise);
	}
	return request(url).then(parseResponse);
};
