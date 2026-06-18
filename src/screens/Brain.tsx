import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export function Brain() {
  const done = useLiveQuery(() => db.tasks.where('status').equals('done').count(), [], 0)
  const active = useLiveQuery(() => db.tasks.where('status').equals('active').count(), [], 0)
  const snoozed = useLiveQuery(
    async () => (await db.tasks.toArray()).reduce((s, t) => s + t.snoozes, 0),
    [],
    0
  )

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
        <div className="card">
          <div className="card-num">{snoozed}</div>
          <div className="card-cap">переносов</div>
        </div>
      </div>

      <p className="note">
        Мозг копит реакции на напоминания и со временем подстроит время и напор под тебя.
        Адаптивная часть появится дальше - сейчас собирается статистика.
      </p>
    </div>
  )
}
