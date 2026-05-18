import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, HelpCircle, ChevronRight, RotateCcw, Youtube, ExternalLink, BookOpen, Cpu, Shuffle } from 'lucide-react'
import Confetti from 'react-confetti'
import GifCard from './GifCard'
import { DEEP_DIVE } from '../data/deepDive'
import { QUIZZES } from '../data/quizzes'
import { CHAPTERS } from '../data/chapters'
import { useProgress } from '../hooks/useProgress'
import { recordQuizSubmission } from '../hooks/useQuizReport'

function MCQQuestion({ q, onAnswer, answered }) {
  const [selected, setSelected] = useState(null)
  const [confidence, setConfidence] = useState(null)

  const handleSelect = (idx) => {
    if (answered) return
    setSelected(idx)
    onAnswer(idx === q.answer)
  }

  return (
    <>
    {/* Confidence rating — must pick before answering (metacognition hook) */}
    {!answered && (
      <div className="flex items-center gap-2 mt-4 mb-1">
        <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>Confidence:</span>
        {['Low', 'Medium', 'High'].map(level => (
          <button
            key={level}
            onClick={() => setConfidence(level)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
            style={confidence === level
              ? { background: level === 'High' ? 'rgba(16,185,129,0.2)' : level === 'Medium' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                  color: level === 'High' ? '#34d399' : level === 'Medium' ? '#fbbf24' : '#f87171',
                  border: `1px solid ${level === 'High' ? 'rgba(16,185,129,0.4)' : level === 'Medium' ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)'}` }
              : { background: 'rgba(255,255,255,0.07)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.15)' }
            }
          >{level}</button>
        ))}
      </div>
    )}
    {/* Show confidence + wrong answer callout for high-confidence misses */}
    {answered && confidence === 'High' && selected !== null && selected !== q.answer && (
      <div className="mt-3 mb-1 px-3 py-2 rounded-lg text-xs font-semibold"
        style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
        ⚡ High confidence + wrong answer — this is your highest-value learning moment. Read the explanation carefully.
      </div>
    )}
    <div className="space-y-2.5 mt-2">
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

        if (!answered) {
          style = { ...style }
        }

        return (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={answered}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3"
            style={style}
            onMouseEnter={e => { if (!answered) e.currentTarget.style.background = 'rgba(59,130,246,0.1)' }}
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
    </>
  )
}

const STOP_WORDS = new Set(['and','the','for','are','with','that','this','not','was','but','can','its','all','has','had','from','into','than','then','when','also','been','have','they','will','would','which','their'])

function scoreAnswer(userInput, correctAnswer) {
  const user = userInput.trim().toLowerCase()
  const correct = correctAnswer.trim().toLowerCase()
  if (user === correct) return true
  // For multi-token answers, check all significant tokens appear in user input
  const tokens = correct.split(/[\s,./\-()]+/).filter(t => t.length > 1 && !STOP_WORDS.has(t))
  if (tokens.length > 1) return tokens.every(t => user.includes(t))
  // Single-token: allow if user input includes the token
  return tokens.length === 1 && user.includes(tokens[0])
}

function FillQuestion({ q, onAnswer, answered }) {
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [confidence, setConfidence] = useState(null)

  const check = () => {
    if (submitted) return
    const isCorrect = scoreAnswer(value, q.answer)
    setSubmitted(true)
    setCorrect(isCorrect)
    onAnswer(isCorrect)
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Confidence rating — same metacognition gate as MCQ */}
      {!submitted && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>Confidence:</span>
          {['Low', 'Medium', 'High'].map(level => (
            <button
              key={level}
              onClick={() => setConfidence(level)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
              style={confidence === level
                ? { background: level === 'High' ? 'rgba(16,185,129,0.2)' : level === 'Medium' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                    color: level === 'High' ? '#34d399' : level === 'Medium' ? '#fbbf24' : '#f87171',
                    border: `1px solid ${level === 'High' ? 'rgba(16,185,129,0.4)' : level === 'Medium' ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)'}` }
                : { background: 'rgba(255,255,255,0.07)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.15)' }
              }
            >{level}</button>
          ))}
        </div>
      )}

      {/* High confidence + wrong callout */}
      {submitted && confidence === 'High' && !correct && (
        <div className="px-3 py-2 rounded-lg text-xs font-semibold"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
          ⚡ High confidence + wrong answer — this is your highest-value learning moment. Read the explanation carefully.
        </div>
      )}

      {q.hint && !submitted && (
        <p className="text-xs italic" style={{ color: '#64748b' }}>Hint: {q.hint}</p>
      )}
      <div className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !submitted && check()}
          disabled={submitted}
          placeholder="Type your answer..."
          className="flex-1 px-4 py-3 rounded-xl font-mono text-sm transition-all outline-none"
          style={submitted
            ? correct
              ? { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.5)', color: '#6ee7b7' }
              : { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.5)', color: '#fca5a5' }
            : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }
          }
        />
        {!submitted && (
          <button
            onClick={check}
            className="btn-primary text-sm"
          >
            Check
          </button>
        )}
      </div>
      {submitted && !correct && (
        <p className="text-sm" style={{ color: '#f87171' }}>
          Correct answer: <span className="font-mono font-bold" style={{ color: '#fca5a5' }}>{q.answer}</span>
        </p>
      )}
    </div>
  )
}

const LEVEL_INSIGHTS = {
  1: "You have the foundation. Most field engineers never formally study this.",
  2: "You can handle real-world edge cases. That separates troubleshooters from guessers.",
  3: "Graduate-level knowledge. You're in rare company on this protocol.",
  4: "You've thought through real deployments. That judgment only comes from doing the work.",
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
  4: {
    headerBg: 'linear-gradient(135deg, rgba(6,14,26,0.95), rgba(5,30,15,0.95))',
    border: 'rgba(34,197,94,0.3)',
    accent: '#4ade80',
    glow: 'rgba(34,197,94,0.2)',
    label: 'Field Scenarios',
    badge: 'rgba(34,197,94,0.15)',
  },
}

// Pass rate estimates per level (social proof)
const PASS_RATE = { 1: 68, 2: 51, 3: 34, 4: 79 }

const ATTEMPT_KEY = (chapterId, level) => `quiz_attempts_${chapterId}_l${level}`
const MISSED_KEY  = (chapterId, level) => `quiz_missed_${chapterId}_l${level}`

function getAttempt(chapterId, level) {
  try { return parseInt(localStorage.getItem(ATTEMPT_KEY(chapterId, level)) || '0', 10) } catch { return 0 }
}
function incAttempt(chapterId, level) {
  try { localStorage.setItem(ATTEMPT_KEY(chapterId, level), String(getAttempt(chapterId, level) + 1)) } catch {}
}
function getMissed(chapterId, level) {
  try { return JSON.parse(localStorage.getItem(MISSED_KEY(chapterId, level)) || '[]') } catch { return [] }
}
function saveMissed(chapterId, level, ids) {
  try { localStorage.setItem(MISSED_KEY(chapterId, level), JSON.stringify(ids)) } catch {}
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

function shuffleOptions(q) {
  if (q.type !== 'mcq' && q.type !== 'scenario') return q
  const indices = q.options.map((_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return {
    ...q,
    options: indices.map(i => q.options[i]),
    answer: indices.indexOf(q.answer),
  }
}

function normalizeQuestion(q) {
  const question = q.question || q.q || ''
  let n = { ...q, question }
  if (n.type === 'tf') {
    const opts = ['True', 'False']
    const idx = opts.indexOf(String(n.answer))
    n = { ...n, type: 'mcq', options: opts, answer: idx >= 0 ? idx : 0 }
  }
  if ((n.type === 'mcq' || n.type === 'scenario') && typeof n.answer === 'string') {
    const idx = (n.options || []).indexOf(n.answer)
    n = { ...n, answer: idx }
  }
  return n
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
  const normalized = questions.map(normalizeQuestion)
  const seed = (attempt + 1) * 31337 + chapterId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + level * 997
  const rng = seededRng(seed)
  let pool = shuffle(normalized, rng).map(q => maybeFlip(shuffleOptions(q), seededRng(seed + 1), attempt))

  // Interleaving: on attempt 3+, splice 2 questions from an adjacent chapter (Make It Stick)
  if (attempt >= 3) {
    const chapList = CHAPTERS.filter(c => c.id !== 'home')
    const idx = chapList.findIndex(c => c.id === chapterId)
    const siblingId = idx > 0 ? chapList[idx - 1].id : chapList[idx + 1]?.id
    if (siblingId) {
      const sibData = QUIZZES[siblingId]
      const rawSibling = sibData ? (Array.isArray(sibData) ? sibData : (sibData[`level${level}`] || [])) : []
      if (rawSibling.length > 0) {
        const sibRng = seededRng(seed + 7777)
        const picked = shuffle(rawSibling.map(normalizeQuestion), sibRng)
          .slice(0, 2)
          .map(q => ({ ...shuffleOptions(q), _interleavedFrom: siblingId }))
        if (pool.length > 3) pool.splice(2, 0, picked[0])
        if (picked.length > 1 && pool.length > 7) pool.splice(6, 0, picked[1])
      }
    }
  }

  return pool
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
  const [reviewMode, setReviewMode] = useState(false)
  const [intentionSet, setIntentionSet] = useState(() => !!localStorage.getItem(`intention_${chapterId}_l${level + 1}`))
  const containerRef = useRef(null)
  useEffect(() => {
    if (finished && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [finished])

  const startReview = () => {
    const missedIds = getMissed(chapterId, level)
    const missedQs = questions.filter(q => missedIds.includes(q.id) || missedIds.includes((q.id))).map(normalizeQuestion)
    if (missedQs.length === 0) return
    setActiveQuestions(missedQs)
    setCurrent(0)
    setAnswers({})
    setShowExplanation(false)
    setFinished(false)
    setShowConfetti(false)
    setReviewMode(true)
  }

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
      const currentAnswers = { ...answers }
      const score = Object.values(currentAnswers).filter(Boolean).length
      const total = activeQuestions.length
      recordQuizSubmission({ chapter: chapterId, level, score, total, attempt: attempt + 1 })
      // Save missed IDs for Review Missed mode
      if (!reviewMode) {
        const missedIds = activeQuestions.filter(q => !currentAnswers[q.id]).map(q => q.id)
        saveMissed(chapterId, level, missedIds)
      }
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
    setReviewMode(false)
  }

  if (finished) {
    const score = Object.values(answers).filter(Boolean).length
    const total = activeQuestions.length
    const wrongCount = total - score
    const pct = Math.round((score / total) * 100)
    const passed = pct >= 70
    const passRate = PASS_RATE[level] || 65
    const missedIds = getMissed(chapterId, level)
    const hasMissed = !reviewMode && missedIds.length > 0
    const siblingLabel = (() => {
      const chapList = CHAPTERS.filter(c => c.id !== 'home')
      const idx = chapList.findIndex(c => c.id === chapterId)
      const sibId = idx > 0 ? chapList[idx - 1].id : chapList[idx + 1]?.id
      return chapList.find(c => c.id === sibId)?.label || ''
    })()

    return (
      <div
        ref={containerRef}
        className="rounded-2xl overflow-hidden my-8"
        style={{
          border: `1px solid ${theme.border}`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${theme.border}`,
          background: 'rgba(6,14,26,0.7)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {showConfetti && <Confetti recycle={false} numberOfPieces={250} />}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8 px-4"
        >
          {reviewMode && (
            <div className="mb-4 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
              Review: Missed Questions
            </div>
          )}

          <div className="text-6xl mb-4">{passed ? '🎉' : '😅'}</div>
          <h3 className="text-2xl font-bold mb-2 text-white">
            {reviewMode
              ? (passed ? 'Those stuck. Good.' : 'Still shaky — review the explanations.')
              : (passed ? 'Nailed it!' : 'Not quite yet...')}
          </h3>

          {/* Dual-framing score (Kahneman) */}
          <p className="text-slate-400 mb-1">
            You got <span className="font-bold" style={{ color: theme.accent }}>{score}/{total}</span> correct
            {wrongCount > 0 && (
              <span style={{ color: '#f87171' }}> — {wrongCount} to review</span>
            )}
          </p>

          {/* Social proof — first attempt only (Cialdini) */}
          {!reviewMode && (
            <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {attempt === 0
                ? `${passRate}% of engineers pass Level ${level} on their first try`
                : `Attempt ${attempt + 1} — persistence is how mastery happens`}
            </p>
          )}

          {/* Level insight on pass (Peak-End Rule) */}
          {passed && !reviewMode && LEVEL_INSIGHTS[level] && (
            <p className="text-sm italic mb-4 max-w-xs mx-auto" style={{ color: theme.accent, opacity: 0.85 }}>
              "{LEVEL_INSIGHTS[level]}"
            </p>
          )}

          {attempt > 0 && !reviewMode && (
            <p className="text-xs text-slate-600 mb-4">
              {attempt >= 3 && siblingLabel
                ? `Attempt ${attempt + 1} — includes interleaved questions from ${siblingLabel}`
                : attempt >= 2
                  ? `Attempt ${attempt + 1} — adversarial mode active (Which is INCORRECT?)`
                  : `Attempt ${attempt + 1} — questions shuffled in a new order`}
            </p>
          )}

          {passed ? (
            <GifCard gifKey="celebrate" caption="Look at you go!" side="right" className="justify-center" />
          ) : (
            <GifCard gifKey="tryAgain" caption="Review the chapter and try again!" side="right" className="justify-center" />
          )}

          {/* Implementation intention — shown after passing a non-final level (Atomic Habits) */}
          {passed && !reviewMode && level < 4 && level < 3 && !intentionSet && (
            <div className="mt-5 p-3 rounded-xl text-left mx-auto max-w-xs"
              style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.18)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(45,212,191,0.7)' }}>
                When are you coming back for Level {level + 1}?
              </p>
              <div className="flex gap-2 flex-wrap">
                {['Today', 'Tomorrow', 'In 3 days'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      localStorage.setItem(`intention_${chapterId}_l${level + 1}`, opt)
                      setIntentionSet(true)
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                    style={{ background: 'rgba(45,212,191,0.1)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.2)' }}
                  >{opt}</button>
                ))}
              </div>
            </div>
          )}
          {passed && !reviewMode && level < 3 && intentionSet && (
            <p className="text-xs mt-3 italic" style={{ color: 'rgba(45,212,191,0.4)' }}>
              ✓ Commitment noted. Level {level + 1} will be here when you return.
            </p>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {reviewMode ? (
              <button onClick={reset} className="btn-secondary flex items-center gap-2">
                <RotateCcw size={16} />
                Back to Full Quiz
              </button>
            ) : (
              <button onClick={reset} className="btn-secondary flex items-center gap-2">
                <RotateCcw size={16} />
                Try Again
              </button>
            )}
            {hasMissed && (
              <button
                onClick={startReview}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-semibold transition-all"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                <RotateCcw size={14} />
                Review Missed ({missedIds.length})
              </button>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
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
            <span className="text-white font-semibold text-sm">
              {reviewMode ? '🔁 Review: Missed Questions' : theme.label}
            </span>
            {attempt > 0 && !reviewMode && (
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
            {q._interleavedFrom && (
              <div className="mb-2 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg"
                style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa' }}>
                <Shuffle size={11} />
                Interleaved — {CHAPTERS.find(c => c.id === q._interleavedFrom)?.label || q._interleavedFrom}
              </div>
            )}
            {q.reference && (
              <div
                className="rounded-xl p-3 mb-3 flex gap-2 text-xs"
                style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                <span className="flex-shrink-0" style={{ color: '#fbbf24' }}>📖</span>
                <div>
                  <span className="font-semibold" style={{ color: '#fcd34d' }}>{q.reference.book}</span>
                  <span className="text-slate-500 mx-1">·</span>
                  <span className="text-slate-400">{q.reference.chapter}</span>
                  {q.reference.page && <span className="text-slate-600">, p. {q.reference.page}</span>}
                </div>
              </div>
            )}
            {q.ai_application && (
              <div
                className="rounded-xl p-3 mb-3 flex gap-2 text-xs"
                style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}
              >
                <span className="flex-shrink-0" style={{ color: '#a78bfa' }}>🤖</span>
                <div style={{ color: '#c4b5fd' }}>{q.ai_application}</div>
              </div>
            )}
            <p className="font-semibold text-white leading-relaxed whitespace-pre-line">
              {q.question}
            </p>

            {(q.type === 'mcq' || q.type === 'scenario') && (
              <MCQQuestion q={q} onAnswer={handleAnswer} answered={answered} />
            )}
            {q.type === 'fill' && (
              <FillQuestion q={q} onAnswer={handleAnswer} answered={answered} />
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
                        {answers[q.id]
                          ? (current + 1 === activeQuestions.length ? '🎯 Key Insight' : '✅ Correct!')
                          : '❌ Not quite...'}
                      </p>
                      <p className="text-sm leading-relaxed text-slate-300">{q.explanation}</p>

                      {/* Audio explanation — plays when element mounts after answer */}
                      <audio
                        key={q.id}
                        src={`${import.meta.env.BASE_URL}audio/${q.id}.mp3`}
                        controls
                        ref={el => { if (el) el.play().catch(() => {}) }}
                        className="mt-3 w-full"
                        style={{ height: 32, filter: 'invert(1) hue-rotate(180deg) brightness(0.85)', borderRadius: 8 }}
                        onError={e => { e.currentTarget.style.display = 'none' }}
                      />

                      {!answers[q.id] && q.keyPoints && q.keyPoints.length > 0 && (
                        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(239,68,68,0.2)' }}>
                          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#f87171' }}>Key Points to Remember</p>
                          <ul className="space-y-1">
                            {q.keyPoints.map((pt, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                                <span className="font-bold flex-shrink-0 mt-0.5" style={{ color: '#f87171' }}>→</span>
                                {pt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dig Deeper */}
                  {(() => {
                    const chapterResources = (q.resources || DEEP_DIVE[chapterId]?.[`level${level}`] || []).slice(0, 3)
                    const refEntry = q.reference
                      ? [{ type: 'book', title: q.reference.book, author: q.reference.author, chapter: q.reference.chapter, page: q.reference.page }]
                      : []
                    const drillResources = [...refEntry, ...chapterResources]
                    if (drillResources.length === 0) return null
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
                          {drillResources.map((r, ri) => (
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
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.08)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <ExternalLink size={15} className="flex-shrink-0" style={{ color: '#60a5fa' }} />
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
                              {r.type === 'dataset' && (
                                <a
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 px-3 py-2.5 transition-colors group"
                                  style={{ background: 'transparent' }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.08)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <Cpu size={15} className="flex-shrink-0" style={{ color: '#34d399' }} />
                                  <span className="text-xs text-slate-400 flex-1 leading-snug group-hover:text-slate-200 transition-colors">{r.title}</span>
                                  <ExternalLink size={11} className="flex-shrink-0 text-slate-600" />
                                </a>
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
