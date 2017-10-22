'use strict';

var _partial = require('./partial');

var _programs = require('./programs');

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
});