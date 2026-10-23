import { describe, expect, it } from 'vitest'
import { counters } from './counters'

describe('counter examples', () => {
  it.each([
    ['things', 0, '한 ___'],
    ['hours', 1, '두 ___'],
    ['months', 0, '일 ___'],
    ['years', 1, '이 ___'],
    ['floors', 2, '삼 ___'],
    ['minutes', 3, '사 ___'],
  ])('uses the correct number system for %s', (id, exampleIndex, expected) => {
    const counter = counters.find(entry => entry.id === id)!
    expect(counter.examples[exampleIndex].sentence).toContain(expected)
  })

  it('stores the number system on every counter', () => {
    expect(counters.every(entry => entry.numberSystem === 'native' || entry.numberSystem === 'sino')).toBe(true)
  })
})
