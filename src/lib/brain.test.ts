import { expect, test } from 'vitest'
import { bestHour, bestWindow, hourlyResponse, type BrainEvent } from './brain'

function done(hour: number): BrainEvent {
  return { type: 'done', ts: new Date(2026, 5, 18, hour, 30, 0).getTime() }
}

test('hourly counts done events by hour', () => {
  const scores = hourlyResponse([done(9), done(9), done(14), { type: 'created', ts: done(9).ts }])
  expect(scores[9]).toBe(2)
  expect(scores[14]).toBe(1)
  expect(scores[0]).toBe(0)
})

test('bestHour defaults to 9 with no data', () => {
  expect(bestHour(new Array(24).fill(0))).toBe(9)
})

test('bestHour picks the peak', () => {
  expect(bestHour(hourlyResponse([done(7), done(8), done(8)]))).toBe(8)
})

test('bestWindow null when empty', () => {
  expect(bestWindow(new Array(24).fill(0))).toBeNull()
})

test('bestWindow finds the busy span', () => {
  const w = bestWindow(hourlyResponse([done(8), done(9), done(10), done(9)]))
  expect(w).not.toBeNull()
  expect(w!.start).toBe(8)
  expect(w!.share).toBe(100)
})
