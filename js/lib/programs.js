'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sumNJs = exports.fibJs = exports.sumN = exports.fib = undefined;

var _partial = require('./partial');

/* eslint-disable prettier/prettier */
// expects `n` in register 0, puts result in register 1
var fib = {
  expr: (0, _partial.block)( // var n = <fn param>
  (0, _partial.num)(1, 0.0), // var f1 = 0
  (0, _partial.num)(2, 1.0), // var f2 = 1
  (0, _partial.loop)(0, (0, _partial.block)( // while (n != 0) {
  (0, _partial.plus)(3, 1, 2), //   val tmp = f1 + f2
  (0, _partial.copy)(1, 2), //   f1 = f2
  (0, _partial.copy)(2, 3), //   f2 = tmp
  (0, _partial.decr)(0))) //   n -= 1
  ), // }
  in: 0,
  out: 1
};

var sumN = {
  expr: (0, _partial.block)((0, _partial.num)(1, 0.0), (0, _partial.loop)(0, (0, _partial.block)((0, _partial.plus)(1, 0, 1), (0, _partial.decr)(0)))),
  in: 0,
  out: 1
  /* eslint-enable prettier/prettier */

};function fibJs0(n, f0, f1) {
  if (n === 0) return f0;
  return fibJs0(n - 1.0, f1, f0 + f1);
}

function fibJs(n) {
  return fibJs0(n, 0, 1);
}

function sumNJs(n) {
  var res = 0;
  for (var i = 1; i <= n; i += 1) {
    res += i;
  }
  return res;
}

exports.fib = fib;
exports.sumN = sumN;
exports.fibJs = fibJs;
exports.sumNJs = sumNJs;