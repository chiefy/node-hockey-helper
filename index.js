
var hockey = require('./lib/Hockey')();

hockey.checkJavaAsync()	
	.then(function(java_info) {
		console.info('Found Java!\n');
	}, function(err) {
		console.error('Could not find Java installed, please install Java and then try again.');	
	})
	.then(hockey.findVLCPathAsync().bind(hockey))
	.then(hockey.getGameIDsAsync.bind(hockey))
	.then(function(data) {
		console.info('got game data ', data);
	}, function(err) {
		throw err;
	});


