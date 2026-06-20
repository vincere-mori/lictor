import { AnimatePresence, motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import { useUI } from '../store'
import { BrandMark } from './BrandMark'

type Step = { title: string; text: string; visual: ReactNode }

const STEPS: Step[] = [
  {
    title: 'Не отстаёт',
    text: 'Это не обычный список дел. Напоминание усиливается, пока ты не сделаешь.',
    visual: (
      <div className="onb-brand">
        <BrandMark />
        <span className="onb-mark">LICTOR</span>
      </div>
    )
  },
  {
    title: 'Три тира',
    text: 'Важность задачи выбираешь сам при добавлении. От неё зависит, насколько настойчиво тебя дёргают.',
    visual: (
      <div className="onb-tiers">
        <div>
          <span className="onb-bar" style={{ background: 'var(--t-moneo)' }} />
          MONEO - тихо
        </div>
        <div>
          <span className="onb-bar" style={{ background: 'var(--accent)' }} />
          INSTO - напор
        </div>
        <div>
          <span className="onb-bar" style={{ background: 'var(--danger)' }} />
          COGO - беспощадный алярм
        </div>
      </div>
    )
  },
  {
    title: 'Жесты',
    text: 'Свайп вправо - готово. Влево - позже. Тап по задаче - правка.',
    visual: (
      <div className="onb-gest">
        <div>
          <b style={{ color: 'var(--accent)' }}>→</b> готово
        </div>
        <div>
          <b>←</b> позже
        </div>
        <div>
          <b>·</b> тап - правка
        </div>
      </div>
    )
  },
  {
    title: 'Дальше - ты',
    text: 'Жми «+ добавить задачу», объединяй в группы, меняй тему в Режиме. Мозг со временем подстроится под тебя.',
    visual: <div className="onb-plus">+</div>
  }
]

export function Onboarding() {
  const open = useUI((s) => s.onboarding)
  const setOpen = useUI((s) => s.setOnboarding)
  const [i, setI] = useState(0)

  if (!open) return null

  const last = i === STEPS.length - 1
  const step = STEPS[i]

  function next() {
    if (last) {
      setOpen(false)
      setI(0)
    } else {
      setI(i + 1)
    }
  }
  function skip() {
    setOpen(false)
    setI(0)
  }

  return (
    <div className="onb">
      <button className="onb-skip" onClick={skip}>
        пропустить
      </button>
      <div className="onb-body">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.24 }}
          >
            {step.visual}
            <div className="onb-title">{step.title}</div>
            <div className="onb-text">{step.text}</div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="onb-foot">
        <div className="onb-dots">
          {STEPS.map((_, d) => (
            <span key={d} className={d === i ? 'on' : ''} />
          ))}
        </div>
        <button className="btn onb-next" onClick={next}>
          {last ? 'Начать' : 'Дальше'}
        </button>
      </div>
    </div>
  )
}
