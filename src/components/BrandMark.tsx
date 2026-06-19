import { motion } from 'framer-motion'

// фасции ликтора: прутья вырастают, перевязь ложится и медленно пульсирует
export function BrandMark() {
  const rods = [0, 1, 2, 3]
  return (
    <svg width="22" height="26" viewBox="0 0 22 26" aria-hidden="true">
      {rods.map((i) => (
        <motion.rect
          key={i}
          x={2 + i * 5}
          y="2"
          width="3"
          height="22"
          fill="var(--accent)"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
          style={{ transformOrigin: 'center bottom' }}
        />
      ))}
      <motion.rect
        x="0"
        y="11"
        width="22"
        height="2.6"
        fill="var(--danger)"
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: [1, 0.5, 1] }}
        transition={{
          scaleX: { delay: 0.42, duration: 0.4, ease: 'easeOut' },
          opacity: { delay: 1, duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
        }}
        style={{ transformOrigin: 'left center' }}
      />
    </svg>
  )
}
