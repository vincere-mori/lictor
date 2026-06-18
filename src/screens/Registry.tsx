import { motion } from 'framer-motion'
import { sampleTasks } from '../data/sample'
import { TaskRow } from '../components/TaskRow'

export function Registry() {
  return (
    <motion.div
      className="list"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      {sampleTasks.map((t) => (
        <TaskRow key={t.id} task={t} />
      ))}
    </motion.div>
  )
}
