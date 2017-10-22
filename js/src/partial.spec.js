// @flow
/* eslint-disable no-param-reassign, no-use-before-define, no-console */
/* istanbul ignore */
import benchmark from 'benchmark'

const unreachable: empty => empty = () => {
  throw new Error('Unreachable code!')
}

type Register = 0 | 1 | 2 | 3

// eslint-disable-next-line no-use-before-define
type Expr = Num | Plus | Decr | Copy | Block | Loop

/** Set register `d` (for "destination") equal to `n`. */
type Num = {| type: 'num', d: Register, n: number |}
/** Set register `d` equal to register `i` + register `j`. */
type Plus = {| type: 'plus', d: Register, i: Register, j: Register |}
/** Decrement register `d`. */
type Decr = {| type: 'decr', d: Register |}
/** Set register `d` equal to register `i`. */
type Copy = {| type: 'copy', d: Register, i: Register |}
/** Run the instructions in `es` in sequence. */
type Block = {| type: 'block', es: Expr[] |}
/** Execute `p` repeatedly until the `haltIf0` register is 0. */
type Loop = {| type: 'loop', haltIf0: Register, p: Expr |}

function num(d: Register, n: number): Num {
  return { type: 'num', n, d }
}
function plus(d: Register, i: Register, j: Register): Plus {
  return { type: 'plus', d, i, j }
}
function decr(d: Register): Decr {
  return { type: 'decr', d }
}
function copy(d: Register, i: Register): Copy {
  return { type: 'copy', d, i }
}
function block(...es: Expr[]): Block {
  return { type: 'block', es }
}
function loop(haltIf0: Register, p: Expr): Loop {
  return { type: 'loop', haltIf0, p }
}

type Registers = [number, number, number, number]

function interpretLoop(haltIf0: number, p: Expr, m: Registers) {
  while (m[haltIf0] !== 0) interpret(p, m)
}
function interpretBlock(es: Expr[], m: Registers): void {
  es.forEach(e => interpret(e, m))
}

function interpret(e: Expr, m: Registers): void {
  switch (e.type) {
    case 'num':
      m[e.d] = e.n
      break
    case 'plus':
      m[e.d] = m[e.i] + m[e.j]
      break
    case 'decr':
      m[e.d] -= 1
      break
    case 'copy':
      m[e.d] = m[e.i]
      break
    case 'block':
      interpretBlock(e.es, m)
      break
    case 'loop':
      interpretLoop(e.haltIf0, e.p, m)
      break
    default:
      unreachable(e.type)
  }
}

type Op = Registers => void

const partialEvalBlock: (Expr[]) => Op = ps => {
  const compiled: Op[] = ps.map(partialEval)
  return m => {
    for (let i = 0; i < compiled.length; i += 1) {
      compiled[i](m)
    }
  }
}

const partialEval: Expr => Op = e => {
  switch (e.type) {
    case 'num': {
      const { d, n } = e
      return m => {
        m[d] = n
      }
    }
    case 'decr': {
      const { d } = e
      return m => {
        m[d] -= 1
      }
    }
    case 'plus': {
      const { d, i, j } = e
      return m => {
        m[d] = m[i] + m[j]
      }
    }
    case 'copy': {
      const { d, i } = e
      return m => {
        m[d] = m[i]
      }
    }
    case 'loop': {
      const { p, haltIf0 } = e
      const compiled = partialEval(p)
      return m => {
        while (m[haltIf0] !== 0) compiled(m)
      }
    }
    case 'block':
      return partialEvalBlock(e.es)
    default:
      return unreachable(e.type)
  }
}

/* eslint-disable prettier/prettier */
// expects `n` in register 0, puts result in register 1
const fib: Program = {
  expr:
    block(            // var n = <fn param>
      num(1, 0.0),    // var f1 = 0
      num(2, 1.0),    // var f2 = 1
      loop(0, block(  // while (n != 0) {
        plus(3, 1, 2),//   val tmp = f1 + f2
        copy(1, 2),   //   f1 = f2
        copy(2, 3),   //   f2 = tmp
        decr(0)))     //   n -= 1
    ),                // }
  in: 0,
  out: 1,
}

const sumN: Program = {
  expr:
    block(
      num(1, 0.0),
      loop(0, block(
        plus(1, 0, 1),
        decr(0)
      ))
    ),
  in: 0,
  out: 1,
}
/* eslint-enable prettier/prettier */

type Program = {
  expr: Expr,
  in: Register,
  out: Register,
}

const interpreter: Program => number => number = program => x => {
  const registers: Registers = [0, 0, 0, 0]
  registers[program.in] = x
  interpret(program.expr, registers)
  return registers[program.out]
}

const compiler: Program => number => number = program => {
  const compiled = partialEval(program.expr)
  const i = program.in
  const o = program.out
  return x => {
    const registers: Registers = [0, 0, 0, 0]
    registers[i] = x
    compiled(registers)
    return registers[o]
  }
}

function fibJs0(n: number, f0: number, f1: number): number {
  if (n === 0) return f0
  return fibJs0(n - 1.0, f1, f0 + f1)
}

function fibJs(n: number) {
  return fibJs0(n, 0, 1)
}

function sumNJs(n: number) {
  let res = 0
  for (let i = 1; i <= n; i += 1) {
    res += i
  }
  return res
}

describe('partial specialization', () => {
  it('fib should be correct', () => {
    const fibInt = interpreter(fib)
    const fibExe = compiler(fib)
    for (let i = 1; i < 10; i += 1) {
      const native = fibJs(i)
      const interpreted = fibInt(i)
      const compiled = fibExe(i)
      expect(interpreted).toEqual(native)
      expect(compiled).toEqual(native)
    }
  })
  it('sumN should be correct', () => {
    const sumInt = interpreter(sumN)
    const sumExe = compiler(sumN)
    for (let i = 1; i < 10; i += 1) {
      const native = sumNJs(i)
      const interpreted = sumInt(i)
      const compiled = sumExe(i)
      expect(interpreted).toEqual(native)
      expect(compiled).toEqual(native)
    }
  })
  function bench() {
    const n = 10000
    const suite = new benchmark.Suite(`fib${n}`)
    const fibInt = interpreter(fib)
    const fibAsm = compiler(fib)
    suite
      .add('native', () => {
        fibJs(n)
      })
      .add('interpreted', () => {
        fibInt(n)
      })
      .add('compiled', () => {
        fibAsm(n)
      })
      .on('cycle', event => {
        console.log(String(event.target))
      })
      .on('complete', () => {
        console.log('Fastest is ', suite.filter('fastest').map('name'))
      })
      .run({ async: false })
  }
  bench()
})
