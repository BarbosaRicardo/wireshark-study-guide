import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, BookOpen, Home, ScanSearch, Wifi, Filter, Layers, Network, Zap, Globe, Shield, Terminal, FlaskConical, Clock, HelpCircle, ChevronDown } from 'lucide-react'
import { CHAPTERS, CHAPTER_HOOKS, CHAPTER_RETRIEVAL } from '../data/chapters'
import { useProgress } from '../hooks/useProgress'

const READ_TIME = {
  intro: 10, capture: 12, filters: 14, dissectors: 12,
  modbus: 14, dnp3: 12, opcua: 12, security: 14, advanced: 16, lab: 20,
}

const CHAPTER_STAKES = {
  intro:      'Every network problem you will ever debug gets solved faster if you can read packets directly. Most engineers never learn this. You\'re starting here.',
  capture:    'Capturing the wrong interface — or without a SPAN port — means you\'re analyzing your own traffic and wondering why the problem doesn\'t show up. This chapter prevents that wasted day.',
  filters:    'A display filter written correctly finds the packet in 10 seconds. Written wrong, it hides the packet you\'re looking for. The difference is knowing the filter syntax.',
  dissectors: 'Wireshark can\'t always tell what protocol is in a non-standard port. Knowing how to force it changes whether you can read the traffic at all.',
  modbus:     'Modbus has no authentication. Wireshark makes that visible in seconds. This chapter is where the abstract security concern becomes a concrete frame on your screen.',
  dnp3:       'DNP3 Secure Authentication exists because engineers used Wireshark to demonstrate a replay attack that required nothing but a captured session. This chapter shows you what they saw.',
  opcua:      'OPC UA\'s security modes sound reassuring. Wireshark shows you which one is actually in use. Most production systems are using None when they should be using SignAndEncrypt.',
  security:   'Anomaly detection in ICS traffic is pattern recognition. This chapter shows you how a Modbus master that polled 10 coils for 3 years can instantly look different the morning after an intrusion.',
  advanced:   'tshark on a Raspberry Pi, ring-buffer captures, automated alerting — Wireshark is not just a desktop tool. This chapter is where it becomes infrastructure.',
  lab:        'The best Wireshark practice is real traffic. This lab gives you PCAPs to analyze — the same kind of forensic work that traces real incidents.',
}

const ICON_MAP = {
  Home, BookOpen, ScanSearch, Wifi, Filter, Layers, Network, Zap, Globe, Shield, Terminal, FlaskConical,
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
                background: status[cell.key] ? 'rgba(74,222,128,0.28)' : 'transparent',
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

          {/* Left-to-right charging sweep — clipped to filled zone only */}
          {filled > 0 && !isComplete && (
            <div
              className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
              style={{ width: `${(filled / 4) * 100}%`, zIndex: 10 }}
            >
              <motion.div
                className="absolute inset-y-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(74,222,128,0.6) 50%, transparent 100%)',
                  width: '50%',
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.6 }}
              />
            </div>
          )}

          {/* Completed: full green pulse + label */}
          {isComplete && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              animate={{
                background: [
                  'rgba(74,222,128,0.18)',
                  'rgba(74,222,128,0.38)',
                  'rgba(74,222,128,0.18)',
                ],
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ zIndex: 10 }}
            >
              <span
                className="text-xs font-black tracking-widest uppercase"
                style={{
                  color: '#4ade80',
                  letterSpacing: '0.18em',
                  textShadow: '0 0 12px rgba(74,222,128,0.7)',
                }}
              >
                ✓ Completed
              </span>
            </motion.div>
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
  const [retrievalChapter, setRetrievalChapter] = useState(null)
  const [retrievalRevealed, setRetrievalRevealed] = useState(false)

  const chapter = CHAPTERS.find((c) => c.id === chapterId)
  const ChIcon = ICON_MAP[chapter?.icon] || BookOpen
  const prevChapter = prev ? CHAPTERS.find((c) => c.id === prev) : null
  const nextChapter = next ? CHAPTERS.find((c) => c.id === next) : null

  useEffect(() => {
    markChapterVisited(chapterId)
    localStorage.setItem(`ch_visited_${chapterId}`, String(Date.now()))

    const fiveDaysMs = 5 * 86400000
    const now = Date.now()
    const stale = CHAPTERS.filter(c => c.id !== 'home' && c.id !== chapterId && CHAPTER_RETRIEVAL[c.id]).filter(c => {
      const ts = parseInt(localStorage.getItem(`ch_visited_${c.id}`) || '0', 10)
      return ts > 0 && (now - ts) >= fiveDaysMs
    })
    if (stale.length > 0) {
      setRetrievalChapter(stale[Math.floor(Math.random() * stale.length)])
    }

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
            <div>
              <h1 className="text-3xl font-black text-white leading-tight tracking-tight">{title}</h1>
              {READ_TIME[chapterId] && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock size={11} style={{ color: 'rgba(45,212,191,0.5)' }} />
                  <span className="text-xs" style={{ color: 'rgba(45,212,191,0.5)' }}>~{READ_TIME[chapterId]} min read</span>
                </div>
              )}
            </div>
          </div>
          {CHAPTER_STAKES[chapterId] && (
            <p className="mt-3 text-sm italic leading-relaxed" style={{ color: 'rgba(45,212,191,0.55)' }}>
              {CHAPTER_STAKES[chapterId]}
            </p>
          )}
          <div className="mt-4 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,210,160,0.7), rgba(6,182,212,0.4), transparent)' }} />
        </div>

        {/* Spaced retrieval banner */}
        {retrievalChapter && CHAPTER_RETRIEVAL[retrievalChapter.id] && (
          <div className="rounded-xl p-4 mb-2" style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={13} style={{ color: '#a78bfa' }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a78bfa' }}>
                Retrieval Check — {retrievalChapter.label}
              </span>
              <span className="text-xs" style={{ color: 'rgba(167,139,250,0.5)' }}>It's been a while</span>
            </div>
            <p className="text-sm font-semibold text-slate-200 mb-2">{CHAPTER_RETRIEVAL[retrievalChapter.id].q}</p>
            <AnimatePresence>
              {retrievalRevealed ? (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-sm font-mono"
                  style={{ color: '#4ade80' }}
                >
                  {CHAPTER_RETRIEVAL[retrievalChapter.id].a}
                </motion.p>
              ) : (
                <button
                  onClick={() => setRetrievalRevealed(true)}
                  className="text-xs font-semibold flex items-center gap-1"
                  style={{ color: 'rgba(167,139,250,0.7)' }}
                >
                  <ChevronDown size={12} /> Reveal answer
                </button>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Opening hook */}
        {CHAPTER_HOOKS[chapterId] && (
          <div className="rounded-xl p-4 mb-2" style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.15)' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <HelpCircle size={13} style={{ color: 'rgba(45,212,191,0.6)' }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(45,212,191,0.5)' }}>Think First</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(45,212,191,0.75)' }}>{CHAPTER_HOOKS[chapterId]}</p>
          </div>
        )}

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
