import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { bestWindow, hourlyResponse } from '../lib/brain'

const pad = (h: number) => String(h).padStart(2, '0')

export function Brain() {
  const done = useLiveQuery(() => db.tasks.where('status').equals('done').count(), [], 0)
  const active = useLiveQuery(() => db.tasks.where('status').equals('active').count(), [], 0)
  const events = useLiveQuery(() => db.events.toArray(), [], [])

  const scores = hourlyResponse(events)
  const win = bestWindow(scores)
  const max = Math.max(1, ...scores)
  const total = done + active
  const rate = total ? Math.round((done / total) * 100) : 0

  return (
    <div className="screen">
      <div className="stat-big">
        <span className="stat-num">{rate}%</span>
        <span className="stat-cap">выполнено</span>
      </div>

      <div className="cards">
        <div className="card">
          <div className="card-num">{done}</div>
          <div className="card-cap">сделано</div>
        </div>
        <div className="card">
          <div className="card-num">{active}</div>
          <div className="card-cap">активно</div>
        </div>
      </div>

      <div className="seclabel">ОТКЛИК ПО ЧАСАМ</div>
      <div className="hist">
        {scores.map((v, h) => {
          const peak = win ? (h - win.start + 24) % 24 < 3 : false
          return <div key={h} className={peak ? 'hist-bar peak' : 'hist-bar'} style={{ height: `${Math.round((v / max) * 100)}%` }} />
        })}
      </div>
      <div className="hist-axis">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>24</span>
      </div>

      <p className="note">
        {win
          ? `Лучший отклик: ${pad(win.start)}-${pad(win.end)}. Задачи без точного времени Мозг ставит на это окно.`
          : 'Выполняй задачи - Мозг найдёт твоё лучшее время и будет ставить туда напоминания без точного времени.'}
      </p>
    </div>
  )
}
