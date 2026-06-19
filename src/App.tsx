import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Registry } from './screens/Registry'
import { Brain } from './screens/Brain'
import { Mode } from './screens/Mode'
import { IconRegistry, IconBrain, IconMode } from './components/icons'
import { addTaskFromText, db, seedIfEmpty } from './db'
import { useUI, type Screen } from './store'
import { useScheduler } from './useScheduler'
import { AlarmOverlay } from './components/AlarmOverlay'
import { Praise } from './components/Praise'
import { EditSheet } from './components/EditSheet'

const LABEL: Record<Screen, string> = { registry: 'РЕЕСТР', brain: 'МОЗГ', mode: 'РЕЖИМ' }

export default function App() {
  const screen = useUI((s) => s.screen)
  const setScreen = useUI((s) => s.setScreen)
  const theme = useUI((s) => s.theme)
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const activeCount = useLiveQuery(() => db.tasks.where('status').equals('active').count(), [], 0)

  useScheduler()
  useEffect(() => {
    seedIfEmpty()
  }, [])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  async function submit() {
    const value = text.trim()
    if (!value) return
    setText('')
    await addTaskFromText(value)
    inputRef.current?.blur()
  }

  return (
    <div className="app">
      <AlarmOverlay />
      <Praise />
      <EditSheet />

      <header className="head">
        <div className="head-top">
          <span className="wordmark">LICTOR</span>
          <span className="tagline">sine mora</span>
        </div>
        <div className="rule" />
        <div className="seclabel">
          <span>{LABEL[screen]}</span>
          {screen === 'registry' ? <span>{activeCount} АКТИВНЫХ</span> : null}
        </div>
      </header>

      {screen === 'registry' ? (
        <>
          <form
            className="capture"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <input
              ref={inputRef}
              className="capture-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="новая задача…"
            />
            <button type="submit" className="add" aria-label="добавить">
              +
            </button>
          </form>
          <div className="capture-hint">время и важность поймёт само: «зал завтра 18:00 жёстко»</div>
        </>
      ) : null}

      <main className="main">
        {screen === 'registry' ? <Registry /> : null}
        {screen === 'brain' ? <Brain /> : null}
        {screen === 'mode' ? <Mode /> : null}
      </main>

      <footer className="foot">
        <nav className="nav">
          <button
            className={'nav-item' + (screen === 'registry' ? ' active' : '')}
            onClick={() => setScreen('registry')}
          >
            <IconRegistry />
            <span className="nav-label">РЕЕСТР</span>
          </button>
          <button
            className={'nav-item' + (screen === 'brain' ? ' active' : '')}
            onClick={() => setScreen('brain')}
          >
            <IconBrain />
            <span className="nav-label">МОЗГ</span>
          </button>
          <button
            className={'nav-item' + (screen === 'mode' ? ' active' : '')}
            onClick={() => setScreen('mode')}
          >
            <IconMode />
            <span className="nav-label">РЕЖИМ</span>
          </button>
        </nav>
      </footer>
    </div>
  )
}
