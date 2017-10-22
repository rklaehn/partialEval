'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.num = num;
exports.plus = plus;
exports.decr = decr;
exports.copy = copy;
exports.block = block;
exports.loop = loop;
exports.interpret = interpret;
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

var partialEval = exports.partialEval = function partialEval(e) {
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

exports.interpreter = interpreter;
exports.compiler = compiler;