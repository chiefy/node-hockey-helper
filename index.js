var
  argv = require('minimist')(process.argv.slice(2)),
  Hockey = require('./lib/Hockey'),
  Promise = require('bluebird'),
  hockey;

if (!argv._ || argv._.length === 0) {
  console.error('Please specify a path to FuckNeulionV2.jar');
  process.exit(1);
}

hockey = new Hockey({
  fn_jar_path: argv._[0]
});

hockey.checkJavaAsync()
  .then(function () {
    console.info('Found Java!');
  }, function () {
    return Promise.reject('Could not find Java installed, please install Java and then try again.');
  })
  .then(hockey.findVLCPathAsync.bind(hockey))
  .then(hockey.getGameIDsAsync.bind(hockey))
  .then(hockey.pickGameAsync.bind(hockey))
  .then(hockey.launchFNAsync.bind(hockey))
  .then(hockey.launchVLC.bind(hockey))
  .catch(function onCatch(err) {
    console.error('Uh-oh! Looks like there was a problem... \n' + err);
  });