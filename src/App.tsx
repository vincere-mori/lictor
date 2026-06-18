import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Registry } from './screens/Registry'
import { Brain } from './screens/Brain'
import { Mode } from './screens/Mode'
import { IconRegistry, IconBrain, IconMode } from './components/icons'
import { addTaskFromText, db, seedIfEmpty } from './db'
import { useUI, type Screen } from './store'
import { useScheduler } from './useScheduler'

const LABEL: Record<Screen, string> = { registry: 'РЕЕСТР', brain: 'МОЗГ', mode: 'РЕЖИМ' }

export default function App() {
  const screen = useUI((s) => s.screen)
  const setScreen = useUI((s) => s.setScreen)
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const activeCount = useLiveQuery(() => db.tasks.where('status').equals('active').count(), [], 0)

  useScheduler()
  useEffect(() => {
    seedIfEmpty()
  }, [])

  async function submit() {
    const value = text.trim()
    if (!value) return
    setText('')
    await addTaskFromText(value)
    inputRef.current?.blur()
  }

  return (
    <div className="app">
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

      <main className="main">
        {screen === 'registry' ? <Registry /> : null}
        {screen === 'brain' ? <Brain /> : null}
        {screen === 'mode' ? <Mode /> : null}
      </main>

      <footer className="foot">
        {screen === 'registry' ? (
          <form
            className="capture"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <span className="capture-plus">+</span>
            <input
              ref={inputRef}
              className="capture-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="что нужно? напр. позвонить маме завтра 18:00 жёстко"
            />
            <button type="submit" className="capture-send" aria-label="добавить">
              ↑
            </button>
          </form>
        ) : null}

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
