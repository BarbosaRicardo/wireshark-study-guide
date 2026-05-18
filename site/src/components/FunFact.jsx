import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, RefreshCw, Music2, Zap, Cpu, Archive, Building2, AlertTriangle, AlertOctagon, Shield, Radio, Hash, Binary, Ghost, BookOpen } from 'lucide-react'
import { FUN_FACTS, FIELD_STORIES } from '../data/chapters'

const ICON_MAP = {
  Music2, Zap, Cpu, Archive, Building2, AlertTriangle, AlertOctagon, Shield, Radio, Hash, Binary, Ghost,
}

// 3 yellow dots + 1 red dot; hitting the red one reveals the field story
const STEPS = 4

export default function FunFact({ index }) {
  const [step, setStep] = useState(0)
  const [factIdx, setFactIdx] = useState(
    index !== undefined ? index % FUN_FACTS.length : Math.floor(Math.random() * FUN_FACTS.length)
  )
  const [storyIdx, setStoryIdx] = useState(
    index !== undefined ? index % FIELD_STORIES.length : Math.floor(Math.random() * FIELD_STORIES.length)
  )

  const isStory = step === STEPS - 1

  const next = () => {
    const nextStep = (step + 1) % STEPS
    setStep(nextStep)
    if (nextStep === STEPS - 1) {
      setStoryIdx(s => (s + 1) % FIELD_STORIES.length)
    } else {
      setFactIdx(c => (c + 1) % FUN_FACTS.length)
    }
  }

  const fact = FUN_FACTS[factIdx]
  const story = FIELD_STORIES[storyIdx]
  const FactIcon = ICON_MAP[fact.icon] || Lightbulb
  const StoryIcon = ICON_MAP[story.icon] || BookOpen

  return (
    <AnimatePresence mode="wait">
      {isStory ? (
        <motion.div
          key={`story-${storyIdx}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-2xl p-5 my-6 overflow-hidden"
          style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.25)',
            boxShadow: '0 4px 24px rgba(239,68,68,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)' }} />

          <div className="flex items-start gap-3">
            <div
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 0 16px rgba(239,68,68,0.4)' }}
            >
              <StoryIcon size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#f87171' }}>Field Story</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}>Real incident</span>
              </div>
              <p className="text-xs font-bold mb-2" style={{ color: '#fca5a5' }}>{story.title}</p>
              <p className="text-sm leading-relaxed" style={{ color: '#fdba74' }}>{story.story}</p>
            </div>
          </div>

          <div className="mt-3 ml-12 flex items-center gap-3">
            <button
              onClick={next}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
              style={{ color: '#f87171' }}
            >
              <RefreshCw size={12} />
              Another fact
            </button>
            <Dots step={step} />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key={`fact-${factIdx}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-2xl p-5 my-6 overflow-hidden"
          style={{
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.25)',
            boxShadow: '0 4px 24px rgba(245,158,11,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)' }} />

          <div className="flex items-start gap-3">
            <div
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 0 16px rgba(245,158,11,0.4)' }}
            >
              <Lightbulb size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#fbbf24' }}>Fun Fact</span>
                <FactIcon size={16} style={{ color: '#fbbf24' }} />
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#fcd34d' }}>{fact.text}</p>
            </div>
          </div>

          <div className="mt-3 ml-12 flex items-center gap-3">
            <button
              onClick={next}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
              style={{ color: '#fbbf24' }}
            >
              <RefreshCw size={12} />
              Another fact
            </button>
            <Dots step={step} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Dots({ step }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: STEPS }).map((_, i) => {
        const isRed = i === STEPS - 1
        const isActive = i === step
        return (
          <div
            key={i}
            style={{
              width: isActive ? 9 : 7,
              height: isActive ? 9 : 7,
              borderRadius: '50%',
              transition: 'all 0.2s',
              background: isRed
                ? (isActive ? '#ef4444' : 'rgba(239,68,68,0.35)')
                : (isActive ? '#fbbf24' : 'rgba(245,158,11,0.35)'),
              boxShadow: isActive
                ? (isRed ? '0 0 7px rgba(239,68,68,0.7)' : '0 0 7px rgba(245,158,11,0.6)')
                : 'none',
            }}
          />
        )
      })}
    </div>
  )
}
