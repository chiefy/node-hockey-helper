#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var _ = require('lodash');
var hockey = require('./lib/Hockey')();
var Promise = require('bluebird');
var log = require('./lib/log');

_.bindAll(hockey);

hockey.checkJavaAsync()
	.then(function foundJava() {
		log.ok('Found Java!');
	}, function sadJava() {
		return Promise.reject('Could not find Java installed, please install Java and then try again.');
	})
	.then(hockey.checkFNAsync)
	.then(hockey.getGameIDsAsync)
	.then(hockey.pickGameAsync)
	.then(hockey.launchFNAsync)
	.catch(function onCatch(err) {
		log.error('Uh-oh! Looks like there was a problem... \n' + err);
	});
