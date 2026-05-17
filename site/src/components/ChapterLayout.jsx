import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, BookOpen, Home, Database, Binary, Cpu, Radio, FileText, Globe, Settings, AlertTriangle, Wrench, Shield, FlaskConical } from 'lucide-react'
import { CHAPTERS } from '../data/chapters'
import { useProgress } from '../hooks/useProgress'

const ICON_MAP = {
  Home, BookOpen, Database, Binary, Cpu, Radio, FileText, Globe, Settings, AlertTriangle, Wrench, Shield, FlaskConical,
}

function ChapterBattery({ status, nextChapter }) {
  const cells = [
    { key: 'level1Passed', label: 'L1' },
    { key: 'level2Passed', label: 'L2' },
    { key: 'level3Passed', label: 'L3' },
    { key: 'level4Passed', label: 'Field' },
  ]
  const filled = cells.filter((c) => status[c.key]).length
  const isComplete = filled === 4

  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      {/* Battery body */}
      <div className="flex items-center gap-0">
        {/* Main battery rectangle */}
        <div
          className="relative flex rounded-xl overflow-hidden"
          style={{
            width: 260,
            height: 52,
            border: isComplete ? '1.5px solid rgba(74,222,128,0.6)' : '1.5px solid rgba(255,255,255,0.14)',
            boxShadow: isComplete ? '0 0 18px rgba(74,222,128,0.3)' : 'none',
            background: 'rgba(0,0,0,0.35)',
            transition: 'all 0.5s ease',
          }}
        >
          {/* 4 cells */}
          {cells.map((cell, i) => (
            <div
              key={cell.key}
              className="flex-1 flex items-center justify-center relative"
              style={{
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                background: status[cell.key]
                  ? isComplete
                    ? 'rgba(74,222,128,0.32)'
                    : 'rgba(74,222,128,0.28)'
                  : 'transparent',
                transition: 'background 0.4s ease',
              }}
            >
              {!isComplete && (
                <span
                  className="text-xs font-bold"
                  style={{
                    color: status[cell.key] ? '#86efac' : 'rgba(255,255,255,0.18)',
                    transition: 'color 0.4s ease',
                  }}
                >
                  {cell.label}
                </span>
              )}
            </div>
          ))}

          {/* Center label overlay — only when complete */}
          {isComplete && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span
                className="text-xs font-black tracking-widest uppercase"
                style={{
                  color: '#4ade80',
                  letterSpacing: '0.18em',
                  textShadow: '0 0 12px rgba(74,222,128,0.7)',
                }}
              >
                ✓ COMPLETED
              </span>
            </div>
          )}
        </div>

        {/* Battery nub */}
        <div
          className="rounded-r-md"
          style={{
            width: 8,
            height: 22,
            background: isComplete ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.12)',
            marginLeft: 2,
            transition: 'background 0.5s ease',
          }}
        />
      </div>

      {/* Cell legend */}
      <div className="flex gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {cells.map((cell) => (
          <span
            key={cell.key}
            style={{ color: status[cell.key] ? '#86efac' : 'rgba(255,255,255,0.25)' }}
          >
            {cell.label === 'Field' ? 'Field Scenarios' : `Level ${cell.label.slice(1)}`}
          </span>
        ))}
      </div>

      {/* Next Up card — shown when complete */}
      {isComplete && nextChapter && (
        <Link
          to={nextChapter.path}
          className="flex items-center gap-3 w-full max-w-sm px-5 py-4 rounded-2xl transition-all hover:scale-[1.02] mt-2"
          style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.2)' }}
        >
          <div className="flex-1">
            <div className="text-xs mb-0.5" style={{ color: 'rgba(74,222,128,0.6)' }}>Next Up</div>
            <div className="font-bold text-white text-sm">{nextChapter.label}</div>
          </div>
          <ChevronRight size={18} style={{ color: 'rgba(74,222,128,0.6)' }} />
        </Link>
      )}
    </div>
  )
}

export default function ChapterLayout({ chapterId, title, children, prev, next }) {
  const { markChapterVisited, markChapterComplete, getChapterStatus } = useProgress()
  const navigate = useNavigate()
  const status = getChapterStatus(chapterId)

  const chapter = CHAPTERS.find((c) => c.id === chapterId)
  const ChIcon = ICON_MAP[chapter?.icon] || BookOpen
  const prevChapter = prev ? CHAPTERS.find((c) => c.id === prev) : null
  const nextChapter = next ? CHAPTERS.find((c) => c.id === next) : null

  useEffect(() => {
    markChapterVisited(chapterId)
    window.scrollTo(0, 0)
  }, [chapterId])

  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return
      if (e.key === 'ArrowLeft' && prevChapter) navigate(prevChapter.path)
      if (e.key === 'ArrowRight' && nextChapter) navigate(nextChapter.path)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prevChapter, nextChapter])

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-3xl mx-auto py-8 px-4 pb-24"
      >
        {/* Chapter header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm font-medium mb-3" style={{ color: 'rgba(45,212,191,0.7)' }}>
            <span>SCADA Training</span>
            <span className="text-slate-600">›</span>
            <span className="text-slate-500">{title}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(0,210,160,0.2), rgba(6,182,212,0.15))', border: '1px solid rgba(0,210,160,0.3)' }}>
              <ChIcon size={28} style={{ color: '#2dd4bf' }} />
            </div>
            <h1 className="text-3xl font-black text-white leading-tight tracking-tight">{title}</h1>
          </div>
          <div className="mt-4 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,210,160,0.7), rgba(6,182,212,0.4), transparent)' }} />
        </div>

        {/* Content */}
        <div className="space-y-6 text-slate-300 leading-relaxed">
          {children}
        </div>

        {/* Battery completion widget */}
        <ChapterBattery status={status} nextChapter={nextChapter} />

      </motion.div>

      {/* Sticky bottom nav bar */}
      <div
        className="fixed bottom-0 left-0 right-0 lg:left-64 z-30 flex items-center justify-between px-4 h-14"
        style={{ background: 'rgba(8,8,18,0.94)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {prevChapter ? (
          <Link
            to={prevChapter.path}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors group"
          >
            <ChevronLeft size={15} className="group-hover:-translate-x-0.5 transition-transform flex-shrink-0" />
            <span className="hidden sm:block truncate max-w-[160px]">{prevChapter.label}</span>
            <span className="sm:hidden">Prev</span>
          </Link>
        ) : <div />}

        <div className="text-xs font-medium text-slate-600 truncate mx-3 text-center flex-1">{title}</div>

        {nextChapter ? (
          <Link
            to={nextChapter.path}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors text-right group"
          >
            <span className="hidden sm:block truncate max-w-[160px]">{nextChapter.label}</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
          </Link>
        ) : <div />}
      </div>
    </>
  )
}
