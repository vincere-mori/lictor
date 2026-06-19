import { expect, test } from 'vitest'
import { pickLine, type LineCtx } from './quotes'

test('every context yields a non-empty line', () => {
  const all: LineCtx[] = ['empty', 'clear', 'overdue', 'alarm', 'done']
  for (const ctx of all) expect(pickLine(ctx, 0).text.length).toBeGreaterThan(0)
})

test('same seed is stable', () => {
  expect(pickLine('done', 3)).toEqual(pickLine('done', 3))
})

test('large seed wraps into range', () => {
  expect(pickLine('alarm', 999).text).toBeTypeOf('string')
  expect(pickLine('overdue', -5).text).toBeTypeOf('string')
})
