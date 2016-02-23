/*
 * keepfast-cli
 *
 * Copyright (c) 2016 Davidson Fellipe, contributors
 * Licensed under the MIT license.
 */

'use strict';

var meow = require('meow');
var updateNotifier = require('update-notifier');
var Promise = require('bluebird');
var engine = require('./lib/engine');

var cli = meow([
  'Usage',
  '  $ keepfast <url>',
  '',
  'Example',
  '  $ keepfast fellipe.com',
  ''
]);

updateNotifier({
  pkg: cli.pkg
}).notify();

if (!cli.input[0]) {
  throw new Error('Please supply a valid URL');
}

var tests = {
  plugins: [
    'keepfast-contrib-phantomas',
    'keepfast-contrib-psi'
  ],
  profiles: []
};

engine.runURL(tests, cli.input[0]);
