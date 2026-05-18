import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye } from 'lucide-react'

export default function CheckYourself({ question, answer }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-5 rounded-xl overflow-hidden"
      style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.18)' }}
    >
      <div className="px-4 py-3">
        <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#60a5fa' }}>
          Check yourself — before scrolling
        </div>
        <p className="text-sm font-medium text-slate-200">{question}</p>

        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.button
              key="reveal"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRevealed(true)}
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold transition-all hover:opacity-80"
              style={{ color: '#60a5fa' }}
            >
              <Eye size={13} />
              Reveal answer
            </motion.button>
          ) : (
            <motion.div
              key="answer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 text-sm leading-relaxed"
              style={{ borderTop: '1px solid rgba(59,130,246,0.15)', color: '#6ee7b7' }}
            >
              {answer}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
