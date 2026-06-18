import { expect, test } from 'vitest'
import { LADDER, level, nextFire, occurrences } from './escalation'

test('MONEO fires once', () => {
  expect(occurrences(1000, 'MONEO')).toEqual([1000])
})

test('INSTO has due plus repeats', () => {
  const occ = occurrences(0, 'INSTO')
  expect(occ.length).toBe(LADDER.INSTO.maxRepeats + 1)
  expect(occ[1]).toBe(LADDER.INSTO.repeatEvery)
})

test('nextFire returns first time after now', () => {
  expect(nextFire(100, 'COGO', 50)).toBe(100)
  expect(nextFire(100, 'COGO', 100)).toBe(100 + LADDER.COGO.repeatEvery)
})

test('nextFire exhausted', () => {
  const last = occurrences(0, 'INSTO').at(-1)!
  expect(nextFire(0, 'INSTO', last + 1)).toBeNull()
})

test('level grows while overdue', () => {
  expect(level(100, 'INSTO', 50)).toBe(0)
  expect(level(100, 'INSTO', 100)).toBe(1)
  expect(level(0, 'INSTO', LADDER.INSTO.repeatEvery)).toBe(2)
})
