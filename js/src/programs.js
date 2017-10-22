// @flow
import { block, num, plus, copy, decr, loop } from './partial'
import type { Program } from './partial'

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

export { fib, sumN, fibJs, sumNJs }
