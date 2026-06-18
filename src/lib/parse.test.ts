import { expect, test } from 'vitest'
import { parseInput } from './parse'

const NOW = new Date(2026, 5, 18, 10, 0, 0, 0).getTime()

test('relative minutes', () => {
  const p = parseInput('купить хлеб через 30 мин', NOW)!
  expect(p.title).toBe('купить хлеб')
  expect(p.tier).toBe('INSTO')
  expect(p.due).toBe(NOW + 30 * 60000)
})

test('tomorrow with time and ferocity', () => {
  const p = parseInput('позвонить маме завтра 18:00 жёстко', NOW)!
  expect(p.title).toBe('позвонить маме')
  expect(p.tier).toBe('COGO')
  expect(p.due).toBe(new Date(2026, 5, 19, 18, 0, 0, 0).getTime())
})

test('today time already passed rolls to tomorrow', () => {
  const p = parseInput('зарядка 9:00', NOW)!
  expect(p.title).toBe('зарядка')
  expect(p.due).toBe(new Date(2026, 5, 19, 9, 0, 0, 0).getTime())
})

test('soft tier and default plus hour', () => {
  const p = parseInput('погулять тихо', NOW)!
  expect(p.tier).toBe('MONEO')
  expect(p.title).toBe('погулять')
  expect(p.due).toBe(NOW + 3600000)
})

test('blank input', () => {
  expect(parseInput('   ', NOW)).toBeNull()
})
