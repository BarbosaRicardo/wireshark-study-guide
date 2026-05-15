import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ScanSearch, Wifi, Filter, Layers, Network, Zap, Globe, Shield, Terminal, FlaskConical, CreditCard } from 'lucide-react'
import { CHAPTERS } from '../data/chapters'
import { useProgress } from '../hooks/useProgress'

const ICON_MAP = {
  ScanSearch, Wifi, Filter, Layers, Network, Zap, Globe, Shield, Terminal, FlaskConical, CreditCard,
}

export default function ChapterLayout({ chapterId, title, children, prev, next }) {
  const { markChapterVisited } = useProgress()

  useEffect(() => {
    markChapterVisited(chapterId)
    window.scrollTo(0, 0)
  }, [chapterId])

  const chapter = CHAPTERS.find((c) => c.id === chapterId)
  const prevChapter = prev ? CHAPTERS.find((c) => c.id === prev) : null
  const nextChapter = next ? CHAPTERS.find((c) => c.id === next) : null
  const Icon = ICON_MAP[chapter?.icon] || ScanSearch

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-3xl mx-auto py-8 px-4"
    >
      {/* Chapter header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm font-medium mb-3" style={{ color: 'rgba(56,189,248,0.75)' }}>
          <span>SCADA Training</span>
          <span className="text-slate-600">›</span>
          <span className="text-slate-500">{title}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', boxShadow: '0 0 24px rgba(14,165,233,0.35)' }}>
            <Icon size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white leading-tight tracking-tight">{title}</h1>
        </div>
        <div className="mt-4 h-px" style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.8), rgba(2,132,199,0.4), transparent)' }} />
      </div>

      {/* Content */}
      <div className="space-y-6 text-slate-300 leading-relaxed">
        {children}
      </div>

      {/* Chapter navigation */}
      <div className="flex justify-between items-center mt-12 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {prevChapter ? (
          <Link
            to={prevChapter.path}
            className="flex items-center gap-2 text-sm text-slate-500 transition-colors group"
            onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
            onMouseLeave={e => e.currentTarget.style.color = ''}
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <div>
              <div className="text-xs text-slate-600">Previous</div>
              <div className="font-medium">{prevChapter.label}</div>
            </div>
          </Link>
        ) : <div />}

        {nextChapter ? (
          <Link
            to={nextChapter.path}
            className="flex items-center gap-2 text-sm text-slate-500 transition-colors text-right group"
            onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
            onMouseLeave={e => e.currentTarget.style.color = ''}
          >
            <div>
              <div className="text-xs text-slate-600">Next Up</div>
              <div className="font-medium">{nextChapter.label}</div>
            </div>
            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ) : <div />}
      </div>
    </motion.div>
  )
}
