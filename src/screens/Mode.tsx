import { useState } from 'react'
import { useUI, type Theme } from '../store'
import { enablePush, pushConfigured, pushEnabled } from '../push'

const THEMES: { id: Theme; name: string; bg: string; accent: string }[] = [
  { id: 'ink', name: 'Чернила', bg: '#16130d', accent: '#F2B23E' },
  { id: 'slate', name: 'Гранит', bg: '#0f1318', accent: '#56B7C3' },
  { id: 'paper', name: 'Пергамент', bg: '#F3ECDC', accent: '#AC6D08' },
  { id: 'marble', name: 'Мрамор', bg: '#F1F3F6', accent: '#2C6A8C' }
]

function currentPerm(): NotificationPermission {
  return typeof Notification !== 'undefined' ? Notification.permission : 'denied'
}

export function Mode() {
  const theme = useUI((s) => s.theme)
  const setTheme = useUI((s) => s.setTheme)
  const setOnboarding = useUI((s) => s.setOnboarding)
  const [perm, setPerm] = useState<NotificationPermission>(currentPerm)
  const [pushOn, setPushOn] = useState(pushEnabled())
  const [pushNote, setPushNote] = useState('')
  const standalone = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches

  async function ask() {
    if (typeof Notification === 'undefined') return
    setPerm(await Notification.requestPermission())
  }

  async function onEnablePush() {
    const r = await enablePush()
    if (r === 'ok') {
      setPushOn(true)
      setPushNote('')
    } else {
      setPushNote(
        r === 'denied'
          ? 'нет разрешения'
          : r === 'unsupported'
            ? 'не поддерживается браузером'
            : r === 'no-api'
              ? 'бэкенд не настроен'
              : 'ошибка подключения'
      )
    }
  }

  const permText = perm === 'granted' ? 'включены' : perm === 'denied' ? 'запрещены в системе' : 'не разрешены'
  const pushText = !pushConfigured() ? 'бэкенд не настроен' : pushOn ? 'включены' : pushNote || 'выключены'

  return (
    <div className="screen">
      <div className="seclabel" style={{ padding: '0 0 10px' }}>
        <span>ТЕМА</span>
      </div>
      <div className="swatches">
        {THEMES.map((t) => (
          <button
            key={t.id}
            className={'swatch' + (theme === t.id ? ' on' : '')}
            onClick={() => setTheme(t.id)}
          >
            <span className="swatch-chip" style={{ background: t.bg }}>
              <span className="swatch-dot" style={{ background: t.accent }} />
            </span>
            <span className="swatch-name">{t.name}</span>
          </button>
        ))}
      </div>

      <div className="set-row" style={{ borderTop: 'none', marginTop: '10px' }}>
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
          <div className="set-title">Пуши на iPhone (в фоне)</div>
          <div className="set-sub">{pushText}</div>
        </div>
        {pushConfigured() && !pushOn ? (
          <button className="btn" onClick={onEnablePush}>
            Включить
          </button>
        ) : null}
      </div>

      <div className="set-row">
        <div>
          <div className="set-title">Установка</div>
          <div className="set-sub">{standalone ? 'установлено как приложение' : 'добавь на экран Домой'}</div>
        </div>
      </div>

      <div className="set-row">
        <div>
          <div className="set-title">Обучение</div>
          <div className="set-sub">как пользоваться</div>
        </div>
        <button className="btn" onClick={() => setOnboarding(true)}>
          Показать
        </button>
      </div>

      <p className="note">
        Полная агрессия - точные будильники, full-screen и работа после закрытия - в Android-сборке. На iPhone
        напоминания при закрытом приложении приходят через пуш-бэкенд (если он настроен).
      </p>
    </div>
  )
}
