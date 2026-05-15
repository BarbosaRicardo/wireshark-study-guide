import React, { useState } from 'react'
import { Lock, ChevronDown, ChevronUp, BookOpen, Youtube, ExternalLink, X, ChevronRight, FlaskConical } from 'lucide-react'
import Quiz from './Quiz'
import { useProgress } from '../hooks/useProgress'
import { QUIZZES } from '../data/quizzes'
import { DEEP_DIVE } from '../data/deepDive'

const LEVEL_META = [
  {
    level: 1,
    label: 'Level 1 — Foundations',
    description: 'Core concepts and protocol mechanics. Pass (≥70%) to unlock Level 2.',
    border: 'rgba(6,182,212,0.3)',
    activeBorder: 'rgba(6,182,212,0.6)',
    accent: '#22d3ee',
    headerBg: 'linear-gradient(135deg, rgba(6,14,26,0.95), rgba(15,30,55,0.95))',
    emoji: '📘',
  },
  {
    level: 2,
    label: 'Level 2 — Applied & Edge Cases',
    description: 'Failure modes and real-world edge cases. Pass to unlock Level 3.',
    border: 'rgba(245,158,11,0.3)',
    activeBorder: 'rgba(245,158,11,0.6)',
    accent: '#fbbf24',
    headerBg: 'linear-gradient(135deg, rgba(6,14,26,0.95), rgba(30,20,50,0.95))',
    emoji: '📙',
  },
  {
    level: 3,
    label: 'Level 3 — Graduate',
    description: 'Spec-depth. References GICSP, WCNA, ICS-CERT, IEEE 1815, NIST SP 800-82.',
    border: 'rgba(239,68,68,0.3)',
    activeBorder: 'rgba(239,68,68,0.6)',
    accent: '#f87171',
    headerBg: 'linear-gradient(135deg, rgba(6,14,26,0.95), rgba(40,10,10,0.95))',
    emoji: '📕',
  },
]

function ResourceDrawer({ resources, level, onClose }) {
  const meta = LEVEL_META[level - 1]

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm z-50 flex flex-col shadow-2xl"
        style={{ background: '#0a1628', borderLeft: `1px solid ${meta.border}` }}>
        <div className="px-4 py-4 flex items-center justify-between flex-shrink-0"
          style={{ background: meta.headerBg, borderBottom: `1px solid ${meta.border}` }}>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: meta.accent }}>Dig Deeper</div>
            <div className="text-white font-semibold text-sm mt-0.5">Level {level} Resources</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {(!resources || resources.length === 0) && (
            <p className="text-slate-500 text-sm text-center py-8">Resources coming soon.</p>
          )}
          {resources?.map((r, i) => (
            <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
              {r.type === 'youtube' && (
                <a href={r.searchUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 transition-colors group"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(239,68,68,0.15)' }}>
                    <Youtube size={18} style={{ color: '#ef4444' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold uppercase tracking-wide" style={{ color: '#ef4444' }}>YouTube</div>
                    <div className="text-sm text-slate-300 font-medium leading-tight truncate">{r.title}</div>
                  </div>
                  <ExternalLink size={14} className="text-slate-600 flex-shrink-0" />
                </a>
              )}
              {r.type === 'doc' && (
                <a href={r.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 transition-colors group"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,165,233,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(14,165,233,0.15)' }}>
                    <ExternalLink size={18} style={{ color: '#38bdf8' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold uppercase tracking-wide" style={{ color: '#38bdf8' }}>Documentation</div>
                    <div className="text-sm text-slate-300 font-medium leading-tight">{r.title}</div>
                  </div>
                  <ExternalLink size={14} className="text-slate-600 flex-shrink-0" />
                </a>
              )}
              {r.type === 'book' && (
                <div className="p-3" style={{ background: 'rgba(245,158,11,0.05)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(245,158,11,0.15)' }}>
                      <BookOpen size={18} style={{ color: '#fbbf24' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold uppercase tracking-wide" style={{ color: '#fbbf24' }}>Textbook</div>
                      <div className="text-sm font-semibold leading-tight" style={{ color: '#fcd34d' }}>{r.title}</div>
                    </div>
                  </div>
                  <div className="mt-2 ml-12 text-xs text-slate-500">
                    {r.chapter}
                    {r.page && <span className="ml-1 font-medium" style={{ color: '#f59e0b' }}>· p. {r.page}</span>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function LevelCard({ meta, questions, chapterId, locked, passed }) {
  const [open, setOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { level, label, description, border, activeBorder, accent, headerBg, emoji } = meta

  const resources = DEEP_DIVE[chapterId]?.[`level${level}`] || []

  return (
    <>
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${open ? activeBorder : border}`, transition: 'border-color 0.2s' }}>
        <button
          onClick={() => !locked && setOpen((o) => !o)}
          className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors"
          style={{
            background: open ? headerBg : 'rgba(255,255,255,0.03)',
            cursor: locked ? 'not-allowed' : 'pointer',
            opacity: locked ? 0.6 : 1,
          }}
        >
          <span className="text-lg leading-none flex-shrink-0">{locked ? '🔒' : passed ? '✅' : emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-white">{label}</div>
            <div className="text-xs mt-0.5 leading-snug" style={{ color: open ? accent : '#64748b' }}>{description}</div>
          </div>
          {!locked && (
            open
              ? <ChevronUp size={18} className="text-slate-400 flex-shrink-0" />
              : <ChevronDown size={18} className="text-slate-600 flex-shrink-0" />
          )}
          {locked && <Lock size={14} className="text-slate-600 flex-shrink-0" />}
        </button>

        {!locked && open && (
          <div style={{ borderTop: `1px solid ${border}` }}>
            {passed && resources.length > 0 && (
              <div className="px-4 py-2 flex items-center justify-between"
                style={{ background: 'rgba(16,185,129,0.06)', borderBottom: `1px solid ${border}` }}>
                <span className="text-xs text-slate-500 font-medium">✅ Level {level} passed</span>
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all"
                  style={{ background: accent === '#22d3ee' ? '#0284c7' : accent === '#fbbf24' ? '#b45309' : '#dc2626' }}
                >
                  Dig Deeper
                  <ChevronRight size={12} />
                </button>
              </div>
            )}

            <div className="p-4">
              {questions && questions.length > 0 ? (
                <Quiz chapterId={chapterId} questions={questions} level={level} />
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <div className="text-3xl mb-2">🚧</div>
                  <div className="font-medium">Level {level} questions are being prepared.</div>
                  <div className="text-xs mt-1">Check back soon.</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {drawerOpen && (
        <ResourceDrawer resources={resources} level={level} onClose={() => setDrawerOpen(false)} />
      )}
    </>
  )
}

function ScenarioCard({ questions, chapterId }) {
  const [open, setOpen] = useState(false)

  if (!questions || questions.length === 0) return null

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${open ? 'rgba(34,197,94,0.6)' : 'rgba(34,197,94,0.25)'}`, transition: 'border-color 0.2s' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors"
        style={{ background: open ? 'linear-gradient(135deg, rgba(6,14,26,0.95), rgba(5,30,15,0.95))' : 'rgba(255,255,255,0.03)' }}
      >
        <FlaskConical size={18} style={{ color: '#4ade80' }} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-white">Field Scenarios</div>
          <div className="text-xs mt-0.5 leading-snug" style={{ color: open ? '#4ade80' : '#64748b' }}>
            Real captures, real decisions. No lock — open to all levels.
          </div>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>
          {questions.length}Q
        </span>
        {open ? <ChevronUp size={18} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-slate-600 flex-shrink-0" />}
      </button>

      {open && (
        <div style={{ borderTop: '1px solid rgba(34,197,94,0.2)' }}>
          <div className="p-4">
            <Quiz chapterId={chapterId} questions={questions} level={4} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function QuizLevels({ chapterId }) {
  const { getChapterStatus } = useProgress()
  const status = getChapterStatus(chapterId)
  const data = QUIZZES[chapterId]

  if (!data) return null

  const isLegacy = Array.isArray(data)
  const levels = {
    level1: isLegacy ? data : (data.level1 || []),
    level2: isLegacy ? [] : (data.level2 || []),
    level3: isLegacy ? [] : (Array.isArray(data.level3) ? data.level3 : (data.level3?.questions || [])),
    scenario: isLegacy ? [] : (data.scenario || []),
  }

  const locked = [false, !status.level1Passed, !status.level2Passed]
  const passed = [status.level1Passed, status.level2Passed, status.level3Passed]

  return (
    <div className="my-8 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Knowledge Levels</span>
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
      </div>
      {LEVEL_META.map((meta, i) => (
        <LevelCard
          key={meta.level}
          meta={meta}
          questions={levels[`level${meta.level}`]}
          chapterId={chapterId}
          locked={locked[i]}
          passed={passed[i]}
        />
      ))}
      <ScenarioCard questions={levels.scenario} chapterId={chapterId} />
    </div>
  )
}
