#!/usr/bin/env node
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var readFile = Promise.promisify(require('fs').readFile);

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
      if (result[item] > reference[item].all) {
        console.log(item, ': ', result[item])
      }
    }
  }
};

exports.runURL = function(tests, url) {
  var plugin;

  for (var i = 0; i < tests.plugins.length; i++) {
    plugin = Promise.promisifyAll(require(tests.plugins[i]));

    plugin
      .output(url)
      .then(function(result) {
        evaluating(result, plugin.getReference().sensors);
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
