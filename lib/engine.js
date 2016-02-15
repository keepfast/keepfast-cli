#!/usr/bin/env node
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var readFile = Promise.promisify(require('fs').readFile);
var chalk = require('chalk');
var httpinvoke = require('httpinvoke');

var getScore = function(value, total, reference, condition, unit) {
  if (!total) {
    return '(should be ' + condition + ' ' + reference +  unit + ')';
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

var compare = function(a, b, operator, result) {
  a = parseInt(a, 10);
  b = parseInt(b, 10);

  if (operator === '<') {
    return a < b;
  } else if (operator === '>') {
    return a > b;
  } else if (operator === '=') {
    return a === b;
  }
};

var getMessage = function(current, reference) {
  var criteria = reference.criteria[0];

  if (!compare(current, criteria.expected, criteria.condition, criteria.result)) {
    return {
      type: 'warning',
      text:(
        chalk.white('    🐢  ' + reference.label + ':') + ' ' +
        chalk.green(current + ' ' +  criteria.unit) + ' ' +
        chalk.gray(getScore(current, reference.desktop, criteria.expected, criteria.condition, criteria.unit))
      )};
  } else {
    return {
      type: 'success',
      text:(
        chalk.white('    😀  ' + reference.label + ':') + ' ' +
        chalk.green(current + ' ' +  criteria.unit)
      )};
  }
}

var print = function(msgs) {
  for (var i = 0; i < msgs.length; i++) {
    console.log(msgs[i].text);
  }
};

var evaluating = function(result, reference) {
  var warnings = [],
    success = [];

  for (var item in reference) {
    if (reference.hasOwnProperty(item)) {
      msg = getMessage(result[item], reference[item]);

      if (msg.type === 'warning') {
        warnings.push(msg)
      } else {
        success.push(msg);
      }
    }
  }

  if (warnings.length) {
    console.log('  ⚠️ ',
      chalk.yellow('Warnings'),
      chalk.gray('(average is related to alexa top 1000 sites)', '\n')
    );

    print(warnings);
    console.log('');
  }

  if (success.length === Object.keys(reference).length) {
    console.log('  👍 ',
      chalk.green('All right, congratulations!', '\n')
    );
  } else {
    console.log('  👍 ',
      chalk.green('Already done!', '\n')
    );
  }

  print(success);
};

var getHeaders = function(url) {
  httpinvoke(url, 'GET', function(err, body, statusCode, headers) {
    if (err) {
      console.log('Failure', err);
    }

    console.log(chalk.white('\n📡  Request:', url ,'\n'));
    console.log(chalk.white('   status code:'), chalk.green(statusCode));
    for (var item in headers) {
      if (headers.hasOwnProperty(item)) {
        console.log('  ', item + ':', chalk.green(headers[item]));
      }
    }
    console.log('');
  });
};

exports.runURL = function(tests, url) {
  var plugin  = {};

  getHeaders(url);

  for (var i = 0; i < tests.plugins.length; i++) {
    pluginName = tests.plugins[i];
    plugin[pluginName] = require(pluginName);

    plugin[pluginName]
      .output(url)
      .then(function(result) {
        console.log(chalk.gray('------------------------------------------------------------------------'));
        console.log(chalk.white('\n🚀  Plugin:', result.plugin, '🌎  URL:', url, '\n'));
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
