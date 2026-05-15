import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, RefreshCw, Info, Archive, AlertTriangle, Zap, Layers, MessageSquare, Shield, Lock, Terminal, Binary, AlertOctagon, BarChart2 } from 'lucide-react'
import { FUN_FACTS } from '../data/chapters'

const ICON_MAP = {
  Info, Archive, AlertTriangle, Zap, Layers, MessageSquare, Shield, Lock, Terminal, Binary, AlertOctagon, BarChart2,
}

export default function FunFact({ index }) {
  const [current, setCurrent] = useState(
    index !== undefined ? index % FUN_FACTS.length : Math.floor(Math.random() * FUN_FACTS.length)
  )
  const fact = FUN_FACTS[current]
  const FactIcon = ICON_MAP[fact.icon] || Info

  const next = () => setCurrent((c) => (c + 1) % FUN_FACTS.length)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={current}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-2xl p-5 my-6 overflow-hidden"
        style={{
          background: 'rgba(14,165,233,0.06)',
          border: '1px solid rgba(14,165,233,0.25)',
          boxShadow: '0 4px 24px rgba(14,165,233,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)' }} />

        <div className="flex items-start gap-3">
          <div
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', boxShadow: '0 0 16px rgba(14,165,233,0.4)' }}
          >
            <Lightbulb size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#38bdf8' }}>Fun Fact</span>
              <FactIcon size={14} style={{ color: '#7dd3fc' }} />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#bae6fd' }}>{fact.text}</p>
          </div>
        </div>

        <button
          onClick={next}
          className="mt-3 ml-12 flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
          style={{ color: '#38bdf8' }}
        >
          <RefreshCw size={12} />
          Another fact
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
