
var hockey = require('./lib/Hockey')();

hockey.checkJavaAsync()	
	.then(function(java_info) {
		console.info('Found Java!\n');
	}, function(err) {
		console.error('Could not find Java installed, please install Java and then try again.');	
	})
	.then(hockey.findVLCPathAsync.bind(hockey))
	.then(hockey.getGameIDsAsync.bind(hockey))
	.then(hockey.pickGameAsync.bind(hockey))
	.then(hockey.launchFNAsync.bind(hockey))
	.then(hockey.launchVLC.bind(hockey));

