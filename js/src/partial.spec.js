// @flow
import { interpreter, compiler } from './partial'
import { fib, sumN, fibJs, sumNJs } from './programs'

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
})
