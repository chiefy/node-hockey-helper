
var utils = {},
	_ = require('lodash');

module.exports = utils;

utils.padZeroes = function padZeroes(str_or_num) {
	var num = parseInt(str_or_num, 10),
		pad_str = '';
	if(_.isNaN(num)) {
		throw new Error('Tried to pad a NaN');
	}
	if(num < 10) {
		pad_str = '0';
	}
	return pad_str + num;
};