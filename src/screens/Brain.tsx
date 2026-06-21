import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { bestWindow, dailyDone, hourlyResponse, streak, todayDone } from '../lib/brain'
import { TaskGraph } from '../components/TaskGraph'

const pad = (h: number) => String(h).padStart(2, '0')

export function Brain() {
  const events = useLiveQuery(() => db.events.toArray(), [], [])
  const active = useLiveQuery(() => db.tasks.where('status').equals('active').count(), [], 0)

  const today = todayDone(events)
  const days = dailyDone(events, 7)
  const st = streak(events)
  const week = days.reduce((a, d) => a + d.count, 0)
  const maxDay = Math.max(1, ...days.map((d) => d.count))
  const win = bestWindow(hourlyResponse(events))

  return (
    <div className="screen">
      <div className="stat-big">
        <span className="stat-num">{st}</span>
        <span className="stat-cap">{st === 1 ? 'день подряд' : 'дней подряд'}</span>
      </div>

      <div className="cards">
        <div className="card">
          <div className="card-num">{today}</div>
          <div className="card-cap">сегодня</div>
        </div>
        <div className="card">
          <div className="card-num">{week}</div>
          <div className="card-cap">за неделю</div>
        </div>
        <div className="card">
          <div className="card-num">{active}</div>
          <div className="card-cap">активно</div>
        </div>
      </div>

      <div className="seclabel">
        <span>ПО ДНЯМ</span>
      </div>
      <div className="days">
        {days.map((d, i) => (
          <div className="day" key={i}>
            <div className="day-track">
              <div
                className={i === days.length - 1 ? 'day-bar today' : 'day-bar'}
                style={{ height: `${Math.round((d.count / maxDay) * 100)}%` }}
              />
            </div>
            <div className="day-label">{d.label}</div>
          </div>
        ))}
      </div>

      <p className="note">
        {win
          ? `Лучшее время отклика: ${pad(win.start)}-${pad(win.end)}. Туда Мозг ставит задачи без точного времени.`
          : 'Выполняй задачи - Мозг найдёт твоё лучшее время и будет ставить туда напоминания.'}
      </p>

      <div className="seclabel" style={{ padding: '20px 0 6px' }}>
        <span>СВЯЗИ</span>
        <span>наведи · потяни</span>
      </div>
      <div className="graph">
        <TaskGraph />
      </div>
    </div>
  )
}
