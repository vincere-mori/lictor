import { useState } from 'react'

function currentPerm(): NotificationPermission {
  return typeof Notification !== 'undefined' ? Notification.permission : 'denied'
}

export function Mode() {
  const [perm, setPerm] = useState<NotificationPermission>(currentPerm)
  const standalone =
    typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches

  async function ask() {
    if (typeof Notification === 'undefined') return
    setPerm(await Notification.requestPermission())
  }

  const permText =
    perm === 'granted' ? 'включены' : perm === 'denied' ? 'запрещены в системе' : 'не разрешены'

  return (
    <div className="screen">
      <div className="set-row">
        <div>
          <div className="set-title">Уведомления</div>
          <div className="set-sub">{permText}</div>
        </div>
        {perm !== 'granted' ? (
          <button className="btn" onClick={ask}>
            Разрешить
          </button>
        ) : null}
      </div>

      <div className="set-row">
        <div>
          <div className="set-title">Установка</div>
          <div className="set-sub">
            {standalone ? 'установлено как приложение' : 'добавь на экран Домой'}
          </div>
        </div>
      </div>

      <p className="note">
        Полная агрессия - точные будильники, full-screen и работа после закрытия - в Android-сборке.
        На iPhone веб ограничен обычными уведомлениями.
      </p>
    </div>
  )
}
