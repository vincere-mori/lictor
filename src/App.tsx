import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { AnimatePresence, motion } from 'framer-motion'
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
import { Onboarding } from './components/Onboarding'
import { haptic } from './lib/haptics'

const LABEL: Record<Screen, string> = { registry: 'ЗАДАЧИ', brain: 'МОЗГ', mode: 'РЕЖИМ' }
const NAV: { id: Screen; label: string; Icon: typeof IconRegistry }[] = [
  { id: 'registry', label: 'ЗАДАЧИ', Icon: IconRegistry },
  { id: 'brain', label: 'МОЗГ', Icon: IconBrain },
  { id: 'mode', label: 'РЕЖИМ', Icon: IconMode }
]

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

  function go(s: Screen) {
    if (s === screen) return
    haptic('light')
    setScreen(s)
  }

  return (
    <div className="app">
      <AlarmOverlay />
      <Praise />
      <EditSheet />
      <AddModal />
      <Onboarding />

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
        <motion.button className="add-trigger" whileTap={{ scale: 0.985 }} onClick={() => { haptic('light'); setAdding(true) }}>
          + добавить задачу
        </motion.button>
      ) : null}

      <main className="main">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
          >
            {screen === 'registry' ? <Registry /> : null}
            {screen === 'brain' ? <Brain /> : null}
            {screen === 'mode' ? <Mode /> : null}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="foot">
        <nav className="nav">
          {NAV.map(({ id, label, Icon }) => (
            <motion.button
              key={id}
              className={'nav-item' + (screen === id ? ' active' : '')}
              whileTap={{ scale: 0.92 }}
              onClick={() => go(id)}
            >
              {screen === id ? <motion.span layoutId="navind" className="nav-ind" /> : null}
              <Icon />
              <span className="nav-label">{label}</span>
            </motion.button>
          ))}
        </nav>
      </footer>
    </div>
  )
}
