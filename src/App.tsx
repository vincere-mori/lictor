import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Registry } from './screens/Registry'
import { Brain } from './screens/Brain'
import { Mode } from './screens/Mode'
import { IconRegistry, IconBrain, IconMode } from './components/icons'
import { db, seedIfEmpty } from './db'
import { useUI, type Screen } from './store'
import { useScheduler } from './useScheduler'
import { AlarmOverlay } from './components/AlarmOverlay'
import { Praise } from './components/Praise'
import { EditSheet } from './components/EditSheet'
import { AddModal } from './components/AddModal'
import { BrandMark } from './components/BrandMark'

const LABEL: Record<Screen, string> = { registry: 'ЗАДАЧИ', brain: 'МОЗГ', mode: 'РЕЖИМ' }

export default function App() {
  const screen = useUI((s) => s.screen)
  const setScreen = useUI((s) => s.setScreen)
  const setAdding = useUI((s) => s.setAdding)
  const theme = useUI((s) => s.theme)
  const activeCount = useLiveQuery(() => db.tasks.where('status').equals('active').count(), [], 0)

  useScheduler()
  useEffect(() => {
    seedIfEmpty()
  }, [])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <div className="app">
      <AlarmOverlay />
      <Praise />
      <EditSheet />
      <AddModal />

      <header className="head">
        <div className="head-top">
          <div className="brand">
            <BrandMark />
            <span className="wordmark">LICTOR</span>
          </div>
          <span className="tagline">sine mora</span>
        </div>
        <div className="rule" />
        <div className="seclabel">
          <span>{LABEL[screen]}</span>
          {screen === 'registry' ? <span>{activeCount} АКТИВНЫХ</span> : null}
        </div>
      </header>

      {screen === 'registry' ? (
        <button className="add-trigger" onClick={() => setAdding(true)}>
          + добавить задачу
        </button>
      ) : null}

      <main className="main">
        {screen === 'registry' ? <Registry /> : null}
        {screen === 'brain' ? <Brain /> : null}
        {screen === 'mode' ? <Mode /> : null}
      </main>

      <footer className="foot">
        <nav className="nav">
          <button className={'nav-item' + (screen === 'registry' ? ' active' : '')} onClick={() => setScreen('registry')}>
            <IconRegistry />
            <span className="nav-label">ЗАДАЧИ</span>
          </button>
          <button className={'nav-item' + (screen === 'brain' ? ' active' : '')} onClick={() => setScreen('brain')}>
            <IconBrain />
            <span className="nav-label">МОЗГ</span>
          </button>
          <button className={'nav-item' + (screen === 'mode' ? ' active' : '')} onClick={() => setScreen('mode')}>
            <IconMode />
            <span className="nav-label">РЕЖИМ</span>
          </button>
        </nav>
      </footer>
    </div>
  )
}
