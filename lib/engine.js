#!/usr/bin/env node
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var readFile = Promise.promisify(require('fs').readFile);
var chalk = require('chalk');

var getScore = function(value, total) {
  return (Math.round(((value / total) * 100)) - 100) + '%';
};

var getReference = function(name, plugins) {
  for (var i = 0; i < plugins.length; i++) {
    if (plugins[i].plugin === name) {
      return plugins[i].sensors;
    }
  }

  return {};
};

var evaluating = function(result, reference) {
  for (var item in reference) {
    if (reference.hasOwnProperty(item)) {
      if (reference[item].all) {
        if (result[item] > reference[item].all) {
          console.log(chalk.gray(reference[item].label + ':', result[item]), chalk.red('[', getScore(result[item], reference[item].all), 'above average ]'));
        }
      }
    }
  }
  console.log('\nReference: ranking from the Alexa Top 1,000 Sites.');
};

exports.runURL = function(tests, url) {
  var plugin;

  for (var i = 0; i < tests.plugins.length; i++) {
    plugin = Promise.promisifyAll(require(tests.plugins[i]));

    plugin
      .output(url)
      .then(function(result) {
        console.log(chalk.gray('=========================================================================='));
        console.log(chalk.yellow('Analyzing:', url, '\n'));
        evaluating(result, plugin.getReference().sensors);
        console.log(chalk.gray('=========================================================================='));
      });
  }
};

exports.run = function(tests) {
  return new Promise(function (resolve, reject) {
    resolve()
  }).then(function() {
    for (var item in tests.profiles) {
      var pluginName = tests.profiles[item].plugins[0];
      var plugin = Promise.promisifyAll(require(pluginName));

      plugin.extract(tests.profiles[item].domain.url).then(function(result) {
        evaluating(result, getReference(pluginName, tests.plugins));
      });
    }
  });
}
