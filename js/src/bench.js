// @flow
import benchmark from 'benchmark'
import { interpreter, compiler } from './partial'
import { fib, sumN, fibJs, sumNJs } from './programs'

export function bench() {
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