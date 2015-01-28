var request = require('request-promise'),
    spawn = require('child_process').spawn,
    Promise = require('bluebird'),
    fs = require('fs'),
    _ = require('lodash'),
    os = require('os'),
    inquirer = require('inquirer'),
    utils = require('./utils');

module.exports = function factory(options) {
    options = options || {};
    return new Hockey(options);
};

function Hockey(options) {
    if (options.vlc_path) {
        this.vlc_path = options.vlc_path;
    }
    if (options.fn_jar_path) {
        this.fn_jar_path = options.fn_jar_path;
    }
}

Hockey.prototype = {
    game_url_template: _.template('http://live.nhle.com/GameData/GCScoreboard/<%=year%>-<%=month%>-<%=day%>.jsonp'),
    fn_download: 'https://mega.co.nz/#!eF8XiBKY!o_dE6MrC-Eo1zA5AFFIXc_JK9BnGCnaAyv2KhxBXC9c',
    os_type: null,
    vlc_path: null,
    fn_jar_path: null,
    todays_games: []
};

Hockey.prototype._checkJava = function _checkJava(resolve, reject) {

    console.info('Checking for Java...\n\r');

    var java = spawn('java', ['-version']),

        onData = function onData(data) {
            output += data;
        },

        onClose = function onClose(code) {
            if (code === 0) {
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
    var path;
    this.os_type = os.type();
    switch (os_type) {
        case 'Darwin':
            path = '/Users/ext.cnajewicz/Applications/VLC.app/Contents/MacOS';
            break;
        default:
            reject('Could not determind OS type.');
            break;
    }
    this.vlc_path = path;
    resolve(this.vlc_path);
};
Hockey.prototype.findVLCPathAsync = function findVLCPathAsync() {
    return new Promise(this._findVLCPath);
};

Hockey.prototype._pickGame = function _pickGame(args, resolve, reject) {
    args = args || {};

    var pick_game = {
        type: 'list',
        name: 'selected_game',
        message: 'Pick a game',
        choices: []
    },
    pick_home_away = {
    	type: 'list',
    	name: 'home_or_away',
    	message: 'Home or away feed?',
    	choices: ['Home','Away']
    };

    args.games.forEach(function forEach(game) {
        pick_game.choices.push({
            name: game.htn + ' ' + game.htcommon + '\tvs.\t' + game.atn + ' ' + game.atcommon + '\t' + game.bs + '\t' + game.id,
            value: game.id
        });
    });

    inquirer.prompt([pick_game, pick_home_away], resolve);
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

    var _data, _stderr, fn;
    var sudo = require('sudo'),
        sudo_options = {
            cachePassword: true,
            prompt: 'sudo password? (needed to run FuckNeulionV2):',
            spawnOptions: {
                env: process.env,
                cwd: process.cwd()
            }
        };

    console.info(process.cwd(), args.selected_game);

    fn = sudo(['java', '-jar', './FuckNeulionV2.jar', ''+args.selected_game, args.home_or_away], sudo_options);

    fn.stderr.on('data', function(data) {
    	if(!data) {
    		return;
    	}
    	console.info('stderr: ' + data.toString());
    });
    fn.stdout.on('data', function(data) {
    	if(!data) {
    		return;
    	}
        console.info('stdout: ' + data.toString());
    });
    fn.on('error', console.error);
    fn.on('exit', console.info);
    fn.on('close', console.info);

};
Hockey.prototype.launchFNAsync = function launchFNAsync(args) {
    return new Promise(_.partial(this._launchFN, args));
};


Hockey.prototype.launchVLC = function launchVLC(args) {
    args = args || {};
    if (!args.vlc_path) {
        throw new Error('Could not get VLC path for launching VLC');
    }

    var vlc = spawn('./VLC', [], {
        cwd: args.vlc_path,
        env: process.env
    });

    vlc.on('error', console.error);
    vlc.on('close', function onVLCClose(code) {
        console.info('close vlc', err);
    });
    vlc.on('exit', function onVLCExit(code) {
        console.info('vlc exit', err);
    });
    return vlc;
};

Hockey.prototype.getGameIDsAsync = function getGameIDsAsync(vlc_path) {
    var today = new Date(),
        date_data = {
            year: today.getFullYear(),
            month: utils.padZeroes(today.getMonth() + 1),
            day: utils.padZeroes(today.getDate())
        },
        url = this.game_url_template(date_data);

    function parseResponse(data) {
        function dejsonpPromise(resolve, reject) {
            require('dejsonp').guess(data, function(err, result) {
                if (err) {
                    reject(err);
                }
                result.vlc_path = vlc_path;
                resolve(result);
            });
        }
        return new Promise(dejsonpPromise);
    }
    return request(url).then(parseResponse);
};