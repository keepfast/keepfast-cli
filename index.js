var Promise = require('bluebird');
var engine = require('./lib/');

var tests = {
  plugins: [
    'keepfast-contrib-phantomas'
  ],
  profiles: []
};

engine.runURL(tests);
