var Promise = require('bluebird');
var engine = require('./lib/engine');

var tests = {
  plugins: [
    'keepfast-contrib-phantomas',
    'keepfast-contrib-psi'
  ],
  profiles: []
};

engine.runURL(tests, 'http://fellipe.com/');
// engine.runURL(tests, 'https://loadsmart.com');
// engine.runURL(tests, 'http://globoesporte.globo.com/');
// engine.runURL(tests, 'http://julianamalta.com/');
// engine.runURL(tests, 'http://www.nytimes.com/');
// engine.runURL(tests, 'https://www.google.com/');
// engine.runURL(tests, 'https://github.com/');
