// @flow
/* eslint-disable no-param-reassign, no-use-before-define, no-console */
const unreachable: empty => empty = () => {
  throw new Error('Unreachable code!')
}

export type Register = 0 | 1 | 2 | 3

// eslint-disable-next-line no-use-before-define
export type Expr = Num | Plus | Decr | Copy | Block | Loop

/** Set register `d` (for "destination") equal to `n`. */
export type Num = {| type: 'num', d: Register, n: number |}
/** Set register `d` equal to register `i` + register `j`. */
export type Plus = {| type: 'plus', d: Register, i: Register, j: Register |}
/** Decrement register `d`. */
export type Decr = {| type: 'decr', d: Register |}
/** Set register `d` equal to register `i`. */
export type Copy = {| type: 'copy', d: Register, i: Register |}
/** Run the instructions in `es` in sequence. */
export type Block = {| type: 'block', es: Expr[] |}
/** Execute `p` repeatedly until the `haltIf0` register is 0. */
export type Loop = {| type: 'loop', haltIf0: Register, p: Expr |}

export function num(d: Register, n: number): Num {
  return { type: 'num', n, d }
}
export function plus(d: Register, i: Register, j: Register): Plus {
  return { type: 'plus', d, i, j }
}
export function decr(d: Register): Decr {
  return { type: 'decr', d }
}
export function copy(d: Register, i: Register): Copy {
  return { type: 'copy', d, i }
}
export function block(...es: Expr[]): Block {
  return { type: 'block', es }
}
export function loop(haltIf0: Register, p: Expr): Loop {
  return { type: 'loop', haltIf0, p }
}

export type Registers = [number, number, number, number]

function interpretLoop(haltIf0: number, p: Expr, m: Registers) {
  while (m[haltIf0] !== 0) interpret(p, m)
}
function interpretBlock(es: Expr[], m: Registers): void {
  es.forEach(e => interpret(e, m))
}

export function interpret(e: Expr, m: Registers): void {
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

export const partialEval: Expr => Op = e => {
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

export type Program = {
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

export { interpreter, compiler }
