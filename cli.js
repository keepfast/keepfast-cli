#!/usr/bin/env node
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
  console.error('Please supply a valid URL');
  process.exit(1);
}

var tests = {
  plugins: [
    'keepfast-contrib-phantomas',
    'keepfast-contrib-psi'
  ],
  profiles: []
};

engine.runURL(tests, cli.input[0]);
