
var request = require('request-promise'),
	spawn = require('child_process').spawn,
	Promise = require("bluebird"),
	fs = require('fs'),
	_ = require('lodash'),
	os = require('os'),
	utils = require('./utils');

module.exports = function factory(options) {
	options = options || {};
	return new Hockey(options);
};

function Hockey(options) {
	if(options.vlc_path) {
		this.vlc_path = options.vlc_path;
	}
	if(options.fn_jar_path) {
		this.fn_jar_path = options.fn_jar_path;
	}
}

Hockey.prototype = {
	game_url_template: _.template('http://live.nhle.com/GameData/GCScoreboard/<%=year%>-<%=month%>-<%=day%>.jsonp'),
	os_type : null,
	vlc_path: null,
	fn_jar_path : null,
	todays_games: []
};

Hockey.prototype._checkJava = function _checkJava(resolve, reject) {

	console.info('Checking for Java...\n\r');

	var java = spawn('java', ['-version']),
	
		onData = function onData(data) {
			output += data;
		},

		onClose = function onClose(code) {
			if(code === 0) {
				resolve(output);
			} else {
				reject(code);
			}
		},

		output = '';
	
	java.stderr.on('data', onData);
	java.on('error', reject);
	java.on('close', onClose);

};
Hockey.prototype.checkJavaAsync = function checkJavaAsync() {
	return new Promise(this._checkJava);
};

Hockey.prototype._findVLCPath = function _findVLCPath(resolve, reject) {
	this.os_type = os.type();
	
	console.info('Detected OS: ' + this.os_type);

	switch(os_type){
		case 'Darwin':
			resolve('/Applications/VLC.app');
			break;
		default:
			reject('Could not determind OS type.');
			break;
	}

};
Hockey.prototype.findVLCPathAsync = function findVLCPathAsync() {
	return new Promise(this._findVLCPath);
};

Hockey.prototype.getGameIDsAsync = function getGameIDsAsync() {
	var today = new Date(),
		date_data = {
			year: today.getFullYear(),
			month: utils.padZeroes(today.getMonth()+1),
			day: utils.padZeroes(today.getDate())
			},
		url;

		url = this.game_url_template(date_data);

		function parseResponse(data) {
			
			function dejsonpPromise(resolve, reject) {
				require('dejsonp').guess(data, function(err, result) {
					if(err) {
						reject(err);
					}
					resolve(result);
				});
			}
			return new Promise(dejsonpPromise);
		}

		return request(url).then(parseResponse);
};
