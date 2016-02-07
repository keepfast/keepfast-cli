#!/usr/bin/env node
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var readFile = Promise.promisify(require('fs').readFile);
var chalk = require('chalk');

var getScore = function(value, total) {
  if (!total) {
    return '(should be 0)';
  } else {
    var percentual = Math.round(((value / total) * 100)) - 100;
    return '🏁  ' + (percentual > 0 ? '+' : '') + percentual + '% of average';
  }
};

var getReference = function(name, plugins) {
  for (var i = 0; i < plugins.length; i++) {
    if (plugins[i].plugin === name) {
      return plugins[i].sensors;
    }
  }

  return {};
};

var multiResolution = function(current, reference) {
  if (current < reference.desktop || current < reference.mobile) {
    console.log(
      chalk.white('    🐢  ' + reference.label + ':'),
      chalk.green(current),
      chalk.gray(getScore(current, reference.desktop))
      // TODO: We need create one way to considering mult strategies
      // chalk.gray(getScore(current, reference.mobile), 'for mobile')
    );
  }
}

var uniqueResolution = function(current, reference) {
  if (current > reference.all) {
    console.log(
      chalk.white('    🐢  ' + reference.label + ':'),
      chalk.green(current),
      chalk.gray(getScore(current, reference.all)));
  }
}

var evaluating = function(result, reference) {
  for (var item in reference) {
    if (reference.hasOwnProperty(item)) {
      if (reference[item].hasOwnProperty('all')) {
        uniqueResolution(result[item], reference[item]);
      } else {
        multiResolution(result[item], reference[item]);
      }
    }
  }
};

exports.runURL = function(tests, url) {
  var plugin  = {};

  for (var i = 0; i < tests.plugins.length; i++) {
    pluginName = tests.plugins[i];
    plugin[pluginName] = require(pluginName);

    plugin[pluginName]
      .output(url)
      .then(function(result) {
        console.log(chalk.gray('------------------------------------------------------------------------'));
        console.log(chalk.white('\n🚀  Running:', result.plugin, 'in', url, '\n'));
        console.log('  ⚠️ ',
          chalk.yellow('Warnings'),
          chalk.gray('(average is related to alexa top 1000 sites)', '\n')
        );
        evaluating(result.sensors, plugin[result.plugin].getReference().sensors);
        console.log(' ');
      });
  }
};
//
// exports.run = function(tests) {
//   return new Promise(function (resolve, reject) {
//     resolve()
//   }).then(function() {
//     for (var item in tests.profiles) {
//       var pluginName = tests.profiles[item].plugins[0];
//       var plugin = Promise.promisifyAll(require(pluginName));
//
//       plugin
//         .extract(tests.profiles[item].domain.url)
//         .then(function(result) {
//           evaluating(result, getReference(pluginName, tests.plugins));
//         });
//     }
//   });
// }
