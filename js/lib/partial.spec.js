'use strict';

var _benchmark = require('benchmark');

var _benchmark2 = _interopRequireDefault(_benchmark);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var unreachable = function unreachable() {
  throw new Error('Unreachable code!');
};

// eslint-disable-next-line no-use-before-define


/** Set register `d` (for "destination") equal to `n`. */

/** Set register `d` equal to register `i` + register `j`. */

/** Decrement register `d`. */

/** Set register `d` equal to register `i`. */

/** Run the instructions in `es` in sequence. */

/** Execute `p` repeatedly until the `haltIf0` register is 0. */

/* eslint-disable no-param-reassign, no-use-before-define, no-console */
/* istanbul ignore */


function num(d, n) {
  return { type: 'num', n: n, d: d };
}
function plus(d, i, j) {
  return { type: 'plus', d: d, i: i, j: j };
}
function decr(d) {
  return { type: 'decr', d: d };
}
function copy(d, i) {
  return { type: 'copy', d: d, i: i };
}
function block() {
  for (var _len = arguments.length, es = Array(_len), _key = 0; _key < _len; _key++) {
    es[_key] = arguments[_key];
  }

  return { type: 'block', es: es };
}
function loop(haltIf0, p) {
  return { type: 'loop', haltIf0: haltIf0, p: p };
}

function interpretLoop(haltIf0, p, m) {
  while (m[haltIf0] !== 0) {
    interpret(p, m);
  }
}
function interpretBlock(es, m) {
  es.forEach(function (e) {
    return interpret(e, m);
  });
}

function interpret(e, m) {
  switch (e.type) {
    case 'num':
      m[e.d] = e.n;
      break;
    case 'plus':
      m[e.d] = m[e.i] + m[e.j];
      break;
    case 'decr':
      m[e.d] -= 1;
      break;
    case 'copy':
      m[e.d] = m[e.i];
      break;
    case 'block':
      interpretBlock(e.es, m);
      break;
    case 'loop':
      interpretLoop(e.haltIf0, e.p, m);
      break;
    default:
      unreachable(e.type);
  }
}

var partialEvalBlock = function partialEvalBlock(ps) {
  var compiled = ps.map(partialEval);
  return function (m) {
    for (var _i = 0; _i < compiled.length; _i += 1) {
      compiled[_i](m);
    }
  };
};

var partialEval = function partialEval(e) {
  switch (e.type) {
    case 'num':
      {
        var _d = e.d,
            _n = e.n;

        return function (m) {
          m[_d] = _n;
        };
      }
    case 'decr':
      {
        var _d2 = e.d;

        return function (m) {
          m[_d2] -= 1;
        };
      }
    case 'plus':
      {
        var _d3 = e.d,
            _i2 = e.i,
            _j = e.j;

        return function (m) {
          m[_d3] = m[_i2] + m[_j];
        };
      }
    case 'copy':
      {
        var _d4 = e.d,
            _i3 = e.i;

        return function (m) {
          m[_d4] = m[_i3];
        };
      }
    case 'loop':
      {
        var _p = e.p,
            _haltIf = e.haltIf0;

        var compiled = partialEval(_p);
        return function (m) {
          while (m[_haltIf] !== 0) {
            compiled(m);
          }
        };
      }
    case 'block':
      return partialEvalBlock(e.es);
    default:
      return unreachable(e.type);
  }
};

/* eslint-disable prettier/prettier */
// expects `n` in register 0, puts result in register 1
var fib = {
  expr: block( // var n = <fn param>
  num(1, 0.0), // var f1 = 0
  num(2, 1.0), // var f2 = 1
  loop(0, block( // while (n != 0) {
  plus(3, 1, 2), //   val tmp = f1 + f2
  copy(1, 2), //   f1 = f2
  copy(2, 3), //   f2 = tmp
  decr(0))) //   n -= 1
  ), // }
  in: 0,
  out: 1
};

var sumN = {
  expr: block(num(1, 0.0), loop(0, block(plus(1, 0, 1), decr(0)))),
  in: 0,
  out: 1
  /* eslint-enable prettier/prettier */

};

var interpreter = function interpreter(program) {
  return function (x) {
    var registers = [0, 0, 0, 0];
    registers[program.in] = x;
    interpret(program.expr, registers);
    return registers[program.out];
  };
};

var compiler = function compiler(program) {
  var compiled = partialEval(program.expr);
  var i = program.in;
  var o = program.out;
  return function (x) {
    var registers = [0, 0, 0, 0];
    registers[i] = x;
    compiled(registers);
    return registers[o];
  };
};

function fibJs0(n, f0, f1) {
  if (n === 0) return f0;
  return fibJs0(n - 1.0, f1, f0 + f1);
}

function fibJs(n) {
  return fibJs0(n, 0, 1);
}

function sumNJs(n) {
  var res = 0;
  for (var _i4 = 1; _i4 <= n; _i4 += 1) {
    res += _i4;
  }
  return res;
}

describe('partial specialization', function () {
  it('fib should be correct', function () {
    var fibInt = interpreter(fib);
    var fibExe = compiler(fib);
    for (var _i5 = 1; _i5 < 10; _i5 += 1) {
      var native = fibJs(_i5);
      var interpreted = fibInt(_i5);
      var compiled = fibExe(_i5);
      expect(interpreted).toEqual(native);
      expect(compiled).toEqual(native);
    }
  });
  it('sumN should be correct', function () {
    var sumInt = interpreter(sumN);
    var sumExe = compiler(sumN);
    for (var _i6 = 1; _i6 < 10; _i6 += 1) {
      var native = sumNJs(_i6);
      var interpreted = sumInt(_i6);
      var compiled = sumExe(_i6);
      expect(interpreted).toEqual(native);
      expect(compiled).toEqual(native);
    }
  });
  function bench() {
    var n = 10000;
    var suite = new _benchmark2.default.Suite('fib' + n);
    var fibInt = interpreter(fib);
    var fibAsm = compiler(fib);
    suite.add('native', function () {
      fibJs(n);
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
  bench();
});