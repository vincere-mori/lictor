import { expect, test } from 'vitest'
import { bestHour, bestWindow, dailyDone, hourlyResponse, streak, todayDone, type BrainEvent } from './brain'

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

const NOW = new Date(2026, 5, 18, 12, 0, 0).getTime()
const dayAgo = (n: number): BrainEvent => ({ type: 'done', ts: NOW - n * 86400000 })

test('todayDone counts only today', () => {
  expect(todayDone([dayAgo(0), dayAgo(1), { type: 'created', ts: NOW }], NOW)).toBe(1)
})

test('streak counts consecutive days back from today', () => {
  expect(streak([dayAgo(0), dayAgo(1), dayAgo(2)], NOW)).toBe(3)
  expect(streak([dayAgo(0), dayAgo(2)], NOW)).toBe(1)
  expect(streak([dayAgo(1)], NOW)).toBe(0)
})

test('dailyDone has fixed length and today is last', () => {
  const days = dailyDone([dayAgo(0)], 7, NOW)
  expect(days.length).toBe(7)
  expect(days[6].count).toBe(1)
})
