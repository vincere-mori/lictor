import { useSyncExternalStore } from 'react'

// один общий таймер на всё приложение вместо таймера в каждой строке
let now = Date.now()
let lastMinute = Math.floor(now / 60000)
const secSubs = new Set<() => void>()
const minSubs = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | null = null

function ensure() {
  if (timer !== null) return
  timer = setInterval(() => {
    now = Date.now()
    secSubs.forEach((f) => f())
    const m = Math.floor(now / 60000)
    if (m !== lastMinute) {
      lastMinute = m
      minSubs.forEach((f) => f())
    }
  }, 1000)
}

function stopIfIdle() {
  if (timer !== null && secSubs.size === 0 && minSubs.size === 0) {
    clearInterval(timer)
    timer = null
  }
}

function subSec(cb: () => void) {
  secSubs.add(cb)
  ensure()
  return () => {
    secSubs.delete(cb)
    stopIfIdle()
  }
}

function subMin(cb: () => void) {
  minSubs.add(cb)
  ensure()
  return () => {
    minSubs.delete(cb)
    stopIfIdle()
  }
}

// посекундно - только там, где реально нужно (счётчик просрочки, алярм)
export function useNow(): number {
  return useSyncExternalStore(subSec, () => now)
}

// поминутно - для обычных строк, чтобы не перерисовываться каждую секунду
export function useNowMinute(): number {
  return useSyncExternalStore(subMin, () => now)
}
