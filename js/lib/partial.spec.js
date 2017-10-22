'use strict';

var _benchmark = require('benchmark');

var _benchmark2 = _interopRequireDefault(_benchmark);

var _partial = require('./partial');

var _programs = require('./programs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function bench() {
  var n = 10000;
  var suite = new _benchmark2.default.Suite('fib' + n);
  var fibInt = (0, _partial.interpreter)(_programs.fib);
  var fibAsm = (0, _partial.compiler)(_programs.fib);
  suite.add('native', function () {
    (0, _programs.fibJs)(n);
  }).add('interpreted', function () {
    fibInt(n);
  }).add('compiled', function () {
    fibAsm(n);
  }).on('cycle', function (event) {
    console.log(String(event.target));
  }).on('complete', function () {
    console.log('Fastest is ', suite.filter('fastest').map('name'));
  }).run({ async: false });
}

describe('partial specialization', function () {
  it('fib should be correct', function () {
    var fibInt = (0, _partial.interpreter)(_programs.fib);
    var fibExe = (0, _partial.compiler)(_programs.fib);
    for (var i = 1; i < 10; i += 1) {
      var native = (0, _programs.fibJs)(i);
      var interpreted = fibInt(i);
      var compiled = fibExe(i);
      expect(interpreted).toEqual(native);
      expect(compiled).toEqual(native);
    }
  });
  it('sumN should be correct', function () {
    var sumInt = (0, _partial.interpreter)(_programs.sumN);
    var sumExe = (0, _partial.compiler)(_programs.sumN);
    for (var i = 1; i < 10; i += 1) {
      var native = (0, _programs.sumNJs)(i);
      var interpreted = sumInt(i);
      var compiled = sumExe(i);
      expect(interpreted).toEqual(native);
      expect(compiled).toEqual(native);
    }
  });
  bench();
});