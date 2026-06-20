import { expect, test } from 'vitest'
import { formatLeft, overdueClock } from './time'

test('future formatting', () => {
  expect(formatLeft(60_000)).toEqual({ overdue: false, text: 'через 1 мин' })
  expect(formatLeft(25 * 60_000)).toEqual({ overdue: false, text: 'через 25 мин' })
  expect(formatLeft(7 * 3600_000)).toEqual({ overdue: false, text: 'через 7 ч' })
  expect(formatLeft(2 * 86_400_000)).toEqual({ overdue: false, text: 'через 2 дн' })
})

test('near zero is now', () => {
  expect(formatLeft(30_000).text).toBe('сейчас')
})

test('overdue', () => {
  expect(formatLeft(-5000)).toEqual({ overdue: true, text: 'просрочено' })
})

test('overdue clock', () => {
  expect(overdueClock(-(12 * 60_000 + 24_000))).toBe('−12:24')
  expect(overdueClock(-9000)).toBe('−0:09')
  expect(overdueClock(-(2 * 3600_000 + 5 * 60_000 + 30_000))).toBe('−2:05:30')
})
