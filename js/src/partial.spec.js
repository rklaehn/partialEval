// @flow
import benchmark from 'benchmark'
import { interpreter, compiler } from './partial'
import { fib, sumN, fibJs, sumNJs } from './programs'

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
  bench()
})
