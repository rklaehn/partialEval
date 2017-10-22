// @flow
/* eslint-disable no-console */
import benchmark from 'benchmark'
import { interpreter, compiler } from './partial'
import { fib, fibJs, sumN, sumNJs } from './programs'

export function fibBench() {
  const n = 10000
  const name = `fib${n}`
  const suite = new benchmark.Suite(name)
  const fibInt = interpreter(fib)
  const fibAsm = compiler(fib)
  console.log(name)
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


export function sumNBench() {
  const n = 10000
  const name = `sumN${n}`
  const suite = new benchmark.Suite(name)
  const sumNInt = interpreter(sumN)
  const sumNAsm = compiler(sumN)
  console.log(name)
  suite
    .add('native', () => {
      sumNJs(n)
    })
    .add('interpreted', () => {
      sumNInt(n)
    })
    .add('compiled', () => {
      sumNAsm(n)
    })
    .on('cycle', event => {
      console.log(String(event.target))
    })
    .on('complete', () => {
      console.log('Fastest is ', suite.filter('fastest').map('name'))
    })
    .run({ async: false })
}
