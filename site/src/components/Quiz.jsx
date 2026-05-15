import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, HelpCircle, ChevronRight, RotateCcw, Youtube, ExternalLink, BookOpen, Cpu } from 'lucide-react'
import Confetti from 'react-confetti'
import GifCard from './GifCard'
import { DEEP_DIVE } from '../data/deepDive'
import { useProgress } from '../hooks/useProgress'
import { recordQuizSubmission } from '../hooks/useQuizReport'

function MCQQuestion({ q, onAnswer, answered }) {
  const [selected, setSelected] = useState(null)

  const handleSelect = (idx) => {
    if (answered) return
    setSelected(idx)
    onAnswer(idx === q.answer)
  }

  return (
    <div className="space-y-2.5 mt-4">
      {q.options.map((opt, idx) => {
        const isCorrect = idx === q.answer
        const isSelected = selected === idx

        let style = {
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#94a3b8',
        }
        let badgeStyle = {
          background: 'rgba(255,255,255,0.06)',
          color: '#64748b',
          border: '1px solid rgba(255,255,255,0.08)',
        }

        if (isSelected && isCorrect) {
          style = { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.5)', color: '#6ee7b7', boxShadow: '0 0 12px rgba(16,185,129,0.2)' }
          badgeStyle = { background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.4)' }
        } else if (isSelected && !isCorrect) {
          style = { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.5)', color: '#fca5a5', boxShadow: '0 0 12px rgba(239,68,68,0.15)' }
          badgeStyle = { background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)' }
        } else if (answered && isCorrect) {
          style = { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.35)', color: '#6ee7b7' }
          badgeStyle = { background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
        } else if (answered) {
          style = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#475569' }
        }

        return (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={answered}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3"
            style={style}
            onMouseEnter={e => { if (!answered) e.currentTarget.style.background = 'rgba(14,165,233,0.1)' }}
            onMouseLeave={e => { if (!answered) e.currentTarget.style.background = style.background }}
          >
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={badgeStyle}
            >
              {answered && isCorrect ? '✓' : answered && isSelected ? '✗' : String.fromCharCode(65 + idx)}
            </span>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

const LEVEL_THEME = {
  1: {
    headerBg: 'linear-gradient(135deg, rgba(6,14,26,0.95), rgba(15,30,55,0.95))',
    border: 'rgba(6,182,212,0.3)',
    accent: '#22d3ee',
    glow: 'rgba(6,182,212,0.2)',
    label: 'Level 1 · Foundations',
    badge: 'rgba(6,182,212,0.15)',
  },
  2: {
    headerBg: 'linear-gradient(135deg, rgba(6,14,26,0.95), rgba(30,20,50,0.95))',
    border: 'rgba(245,158,11,0.3)',
    accent: '#fbbf24',
    glow: 'rgba(245,158,11,0.2)',
    label: 'Level 2 · Applied',
    badge: 'rgba(245,158,11,0.15)',
  },
  3: {
    headerBg: 'linear-gradient(135deg, rgba(6,14,26,0.95), rgba(40,10,10,0.95))',
    border: 'rgba(239,68,68,0.3)',
    accent: '#f87171',
    glow: 'rgba(239,68,68,0.2)',
    label: 'Level 3 · Graduate',
    badge: 'rgba(239,68,68,0.15)',
  },
}

const ATTEMPT_KEY = (chapterId, level) => `quiz_attempts_${chapterId}_l${level}`

function getAttempt(chapterId, level) {
  try { return parseInt(localStorage.getItem(ATTEMPT_KEY(chapterId, level)) || '0', 10) } catch { return 0 }
}
function incAttempt(chapterId, level) {
  try { localStorage.setItem(ATTEMPT_KEY(chapterId, level), String(getAttempt(chapterId, level) + 1)) } catch {}
}

function seededRng(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function shuffle(arr, rng) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function shuffleOptions(q, rng) {
  if (q.type !== 'mcq') return q
  const indices = q.options.map((_, i) => i)
  const shuffled = shuffle(indices, rng)
  return {
    ...q,
    options: shuffled.map(i => q.options[i]),
    answer: shuffled.indexOf(q.answer),
  }
}

function maybeFlip(q, rng, attempt) {
  if (q.type !== 'mcq' || q.options.length < 3) return q
  const threshold = attempt >= 3 ? 0.5 : attempt >= 2 ? 0.3 : 0
  if (rng() > threshold) return q
  const wrongIndices = q.options.map((_, i) => i).filter(i => i !== q.answer)
  const newAnswer = wrongIndices[Math.floor(rng() * wrongIndices.length)]
  return {
    ...q,
    _flipped: true,
    question: `⚠️ Critical Thinking: Which of the following statements about this topic is INCORRECT?\n\n(Original context: ${q.question.replace(/^⚠️.*?\n\n/, '')})`,
    answer: newAnswer,
    explanation: `The INCORRECT statement was: "${q.options[newAnswer]}"\n\n${q.explanation}`,
  }
}

function prepareQuestions(questions, chapterId, level, attempt) {
  const seed = (attempt + 1) * 31337 + chapterId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + level * 997
  const rng = seededRng(seed)
  return shuffle(questions, rng).map(q => maybeFlip(shuffleOptions(q, seededRng(seed + q.id.charCodeAt(0))), seededRng(seed + 1), attempt))
}

export default function Quiz({ chapterId, questions, level = 1 }) {
  const { markLevelComplete } = useProgress()
  const [attempt, setAttempt] = useState(() => getAttempt(chapterId, level))
  const [activeQuestions, setActiveQuestions] = useState(() => prepareQuestions(questions, chapterId, level, getAttempt(chapterId, level)))
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showExplanation, setShowExplanation] = useState(false)
  const [finished, setFinished] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const theme = LEVEL_THEME[level] || LEVEL_THEME[1]
  const q = activeQuestions[current]
  const answered = q.id in answers

  const handleAnswer = (correct) => {
    setAnswers((prev) => ({ ...prev, [q.id]: correct }))
    setShowExplanation(true)
  }

  const next = () => {
    setShowExplanation(false)
    if (current + 1 < activeQuestions.length) {
      setCurrent((c) => c + 1)
    } else {
      const score = Object.values(answers).filter(Boolean).length
      const total = activeQuestions.length
      recordQuizSubmission({ chapter: chapterId, level, score, total, attempt: attempt + 1 })
      setFinished(true)
      if (score / total >= 0.7) {
        setShowConfetti(true)
        markLevelComplete(chapterId, level)
        setTimeout(() => setShowConfetti(false), 4000)
      }
    }
  }

  const reset = () => {
    incAttempt(chapterId, level)
    const nextAttempt = attempt + 1
    setAttempt(nextAttempt)
    setActiveQuestions(prepareQuestions(questions, chapterId, level, nextAttempt))
    setCurrent(0)
    setAnswers({})
    setShowExplanation(false)
    setFinished(false)
    setShowConfetti(false)
  }

  if (finished) {
    const score = Object.values(answers).filter(Boolean).length
    const total = questions.length
    const pct = Math.round((score / total) * 100)
    const passed = pct >= 70

    return (
      <>
        {showConfetti && <Confetti recycle={false} numberOfPieces={250} />}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8 px-4"
        >
          <div className="text-6xl mb-4">{passed ? '🎉' : '😅'}</div>
          <h3 className="text-2xl font-bold mb-2 text-white">
            {passed ? 'Nailed it!' : 'Not quite yet...'}
          </h3>
          <p className="text-slate-400 mb-2">
            You got <span className="font-bold" style={{ color: theme.accent }}>{score}/{total}</span> correct ({pct}%)
          </p>
          {attempt > 0 && (
            <p className="text-xs text-slate-600 mb-4">
              Attempt {attempt + 1} — questions were {attempt >= 2 ? 'shuffled + ~50% adversarial (Which is INCORRECT?)' : 'shuffled in a new order'}
            </p>
          )}

          {passed ? (
            <GifCard gifKey="celebrate" caption="Packets decoded. 🦈" side="right" className="justify-center" />
          ) : (
            <GifCard gifKey="tryAgain" caption="Review the chapter and try again!" side="right" className="justify-center" />
          )}

          <div className="mt-6 flex justify-center gap-3">
            <button onClick={reset} className="btn-secondary flex items-center gap-2">
              <RotateCcw size={16} />
              Try Again
            </button>
          </div>
        </motion.div>
      </>
    )
  }

  return (
    <div
      className="rounded-2xl overflow-hidden my-8"
      style={{
        border: `1px solid ${theme.border}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${theme.border}`,
        background: 'rgba(6,14,26,0.7)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ background: theme.headerBg, borderBottom: `1px solid ${theme.border}` }}
      >
        <div className="flex items-center gap-2">
          <HelpCircle size={20} style={{ color: theme.accent }} />
          <div>
            <span className="text-white font-semibold text-sm">{theme.label}</span>
            {attempt > 0 && (
              <span
                className="ml-2 text-xs px-1.5 py-0.5 rounded font-bold"
                style={{ color: theme.accent, background: theme.badge }}
              >
                Attempt {attempt + 1}{attempt >= 2 ? ' · Adversarial' : attempt >= 1 ? ' · Shuffled' : ''}
              </span>
            )}
          </div>
        </div>
        <span className="text-slate-500 text-sm font-mono">
          {current + 1} / {activeQuestions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div
          className="progress-bar"
          style={{ width: `${((current + (answered ? 1 : 0)) / activeQuestions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <p className="font-semibold text-white leading-relaxed whitespace-pre-line">
              {q.question}
            </p>

            {q.type === 'mcq' && (
              <MCQQuestion q={q} onAnswer={handleAnswer} answered={answered} />
            )}

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && answered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5"
                >
                  <div
                    className="rounded-xl p-4 flex gap-3"
                    style={answers[q.id]
                      ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 0 16px rgba(16,185,129,0.1)' }
                      : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 0 16px rgba(239,68,68,0.1)' }
                    }
                  >
                    {answers[q.id]
                      ? <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" style={{ color: '#34d399' }} />
                      : <XCircle size={20} className="flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} />
                    }
                    <div className="min-w-0">
                      <p className="font-semibold text-sm mb-1" style={{ color: answers[q.id] ? '#6ee7b7' : '#fca5a5' }}>
                        {answers[q.id] ? '✅ Correct!' : '❌ Not quite...'}
                      </p>
                      <p className="text-sm leading-relaxed text-slate-300">{q.explanation}</p>
                    </div>
                  </div>

                  {/* Dig Deeper */}
                  {(() => {
                    const chapterResources = (DEEP_DIVE[chapterId]?.[`level${level}`] || []).slice(0, 3)
                    if (chapterResources.length === 0) return null
                    const correct = answers[q.id]
                    return (
                      <div
                        className="mt-3 rounded-xl overflow-hidden"
                        style={{ border: `1px solid ${correct ? 'rgba(255,255,255,0.08)' : 'rgba(245,158,11,0.25)'}` }}
                      >
                        <div
                          className="px-3 py-2"
                          style={{
                            background: correct ? 'rgba(255,255,255,0.03)' : 'rgba(245,158,11,0.07)',
                            borderBottom: `1px solid ${correct ? 'rgba(255,255,255,0.06)' : 'rgba(245,158,11,0.2)'}`,
                          }}
                        >
                          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: correct ? '#64748b' : '#fbbf24' }}>
                            {correct ? '📚 Dig Deeper' : '🎯 Drill It — Review These'}
                          </span>
                        </div>
                        <div>
                          {chapterResources.map((r, ri) => (
                            <div key={ri} style={{ borderTop: ri > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                              {r.type === 'youtube' && (
                                <a
                                  href={r.searchUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 px-3 py-2.5 transition-colors group"
                                  style={{ background: 'transparent' }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <Youtube size={15} className="flex-shrink-0" style={{ color: '#ef4444' }} />
                                  <span className="text-xs text-slate-400 flex-1 leading-snug group-hover:text-slate-200 transition-colors">{r.title}</span>
                                  <ExternalLink size={11} className="flex-shrink-0 text-slate-600" />
                                </a>
                              )}
                              {r.type === 'doc' && (
                                <a
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 px-3 py-2.5 transition-colors group"
                                  style={{ background: 'transparent' }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,165,233,0.08)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <ExternalLink size={15} className="flex-shrink-0" style={{ color: '#38bdf8' }} />
                                  <span className="text-xs text-slate-400 flex-1 leading-snug group-hover:text-slate-200 transition-colors">{r.title}</span>
                                  <ExternalLink size={11} className="flex-shrink-0 text-slate-600" />
                                </a>
                              )}
                              {r.type === 'book' && (
                                <div
                                  className="flex items-start gap-3 px-3 py-2.5"
                                  style={{ background: 'rgba(245,158,11,0.05)' }}
                                >
                                  <BookOpen size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
                                  <div className="text-xs leading-snug">
                                    <span className="font-bold" style={{ color: '#fcd34d' }}>{r.title}</span>
                                    {r.author && <span style={{ color: '#f59e0b' }}> — {r.author}</span>}
                                    <div className="text-slate-500 mt-0.5">{r.chapter}{r.page ? `, p. ${r.page}` : ''}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}

                  <div className="flex justify-end mt-4">
                    <button onClick={next} className="btn-primary flex items-center gap-2 text-sm">
                      {current + 1 < questions.length ? 'Next Question' : 'See Results'}
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
