var Promise = require('bluebird');
var engine = require('./lib/engine');

var tests = {
  plugins: [
    'keepfast-contrib-phantomas'
  ],
  profiles: []
};

engine.runURL(tests, 'http://webcomponentsweekly.me/');
