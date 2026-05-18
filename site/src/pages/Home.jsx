import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Zap, Award, Clock, ArrowRight, ScanSearch, Wifi, Shield, Network, Filter, Layers, Globe, Terminal, FlaskConical, CreditCard, CheckCircle2 } from 'lucide-react'
import { useProgress } from '../hooks/useProgress'
import { CHAPTERS } from '../data/chapters'
import GifCard from '../components/GifCard'
import TrainingPanel from '../components/TrainingPanel'

const ICON_MAP = {
  ScanSearch, Wifi, Filter, Layers, Network, Zap, Globe, Shield, Terminal, FlaskConical, CreditCard, BookOpen,
}

const COMMIT_KEY = 'wireshark_committed'
const LAST_VISIT_KEY = 'wireshark_last_visit'
const BANNER_SHOWN_KEY = 'wireshark_banner_shown'

function getFreshStartMessage() {
  const lastVisit = parseInt(localStorage.getItem(LAST_VISIT_KEY) || '0', 10)
  const lastBanner = parseInt(localStorage.getItem(BANNER_SHOWN_KEY) || '0', 10)
  const now = Date.now()
  const daysSince = (now - lastVisit) / 86400000
  const hoursSinceBanner = (now - lastBanner) / 3600000
  if (hoursSinceBanner < 48) return null
  const d = new Date()
  const isMonday = d.getDay() === 1
  const isFirstOfMonth = d.getDate() === 1
  if (daysSince >= 5 || isMonday || isFirstOfMonth) {
    localStorage.setItem(BANNER_SHOWN_KEY, String(now))
    if (isMonday) return "New week — engineers who study packet analysis consistently find issues 3× faster."
    if (isFirstOfMonth) return "New month, fresh start — what will you finish before it ends?"
    return "Welcome back — pick up where you left off. Your progress is exactly where you left it."
  }
  return null
}

const STATS = [
  { icon: BookOpen,   label: '10 Chapters', sub: 'Capture to forensics' },
  { icon: Zap,        label: '650+ Quizzes', sub: 'Test yourself' },
  { icon: Clock,      label: '~4 Hours',    sub: 'Total study time' },
  { icon: Award,      label: 'Cert Ready',  sub: 'WCA-101 & GICSP' },
]

const HERO_OPTIONS = [
  { id: 'YQitE4YNQNahy',        caption: `I see all packets. I know what you sent.`,                       tooltip: `Wireshark decodes 3000+ protocols out of the box — DNP3, Modbus TCP, IEC 60870-5, PROFINET, EtherNet/IP, and thousands more. If it crosses a wire and you can capture it, Wireshark can read it. Including the cleartext password you were hoping nobody would notice.` },
  { id: 'zFBj4UsdDKX1uEO05l',   caption: `Writing a display filter that actually works on the first try.`, tooltip: `Wireshark display filters use a specific syntax: field.name == value, field.name contains "string". The autocomplete helps. The documentation helps more. Writing filters under deadline pressure while an operator watches is how you learn them permanently.` },
  { id: 'MdSkCCObvFLNv7jsgE',   caption: `Follow TCP Stream: 200 packets become one conversation.`,        tooltip: `Wireshark Follow TCP Stream reassembles a complete exchange between two endpoints in order, showing exactly what each side sent and received. What looked like 200 random packets suddenly tells a coherent story — and usually the problem is obvious once you read it that way.` },
  { id: 'EoH4Wpu8suiNTLpI6j',   caption: `TLS encrypted. Your packet analysis stops here without the keys.`, tooltip: `Wireshark captures TLS handshakes but can't decrypt sessions without the session keys or the server private key. Modern TLS with ECDHE forward secrecy means even the private key isn't enough after the handshake ends. Capture the SSLKEYLOGFILE during the session or accept the ciphertext.` },
  { id: 'SsBz0oSJ1botYaLqAR',        caption: `IO Graph: retransmits spike at 14:32. Exactly when the alarm fired.`, tooltip: `Wireshark IO Graph plots packet metrics over time — counts, bytes, specific field values. Overlaying a TCP retransmit graph with an alarm timeline is how you prove the network caused the incident, not the application. Data beats guesswork in every postmortem.` },
]
export default function Home() {
  const { overallProgress, getChapterStatus, reset } = useProgress()
  const [heroIdx] = useState(() => Math.floor(Math.random() * HERO_OPTIONS.length))
  const [committed, setCommitted] = useState(() => !!localStorage.getItem(COMMIT_KEY))
  const [freshMsg] = useState(() => getFreshStartMessage())
  const [streak] = useState(() => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const lastDate = localStorage.getItem('wireshark_streak_date') || ''
      const cur = parseInt(localStorage.getItem('wireshark_streak') || '0', 10)
      if (lastDate === today) return cur
      const next = lastDate === yesterday ? cur + 1 : 1
      localStorage.setItem('wireshark_streak', String(next))
      localStorage.setItem('wireshark_streak_date', today)
      return next
    } catch { return 1 }
  })
  const prog = overallProgress()

  useState(() => { localStorage.setItem(LAST_VISIT_KEY, String(Date.now())) })

  const chaptersOnly = CHAPTERS.filter(c => c.id !== 'home' && c.id !== 'flashcards')

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  function handleCommit() {
    localStorage.setItem(COMMIT_KEY, '1')
    setCommitted(true)
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto py-10 px-4 space-y-10">

      {/* Fresh Start Effect banner */}
      {freshMsg && (
        <motion.div variants={item}
          className="rounded-xl px-4 py-3 text-sm flex items-center gap-3"
          style={{ background: 'rgba(56,189,248,0.07)', border: '1px solid rgba(56,189,248,0.2)' }}
        >
          <span style={{ color: '#38bdf8' }}>↺</span>
          <span style={{ color: 'rgba(56,189,248,0.8)' }}>{freshMsg}</span>
        </motion.div>
      )}

      {/* Hero */}
      <motion.div variants={item} className="text-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-black text-slate-100 leading-tight mb-4">
              Wireshark<br />
              <span className="text-mblue-600">See Everything.</span>
            </h1>
            <p className="text-slate-500 text-lg leading-relaxed max-w-md">
              The world's most-used packet analyzer — now applied to OT protocols.
              If it's on the wire, Wireshark will show you exactly what it is.
            </p>
            <div className="flex gap-3 mt-6">
              <Link to="/intro" className="btn-primary flex items-center gap-2">
                {prog.visited > 0 ? 'Continue Learning' : 'Start Learning'} <ArrowRight size={16} />
              </Link>
              {prog.pct > 0 && <Link to="/lab" className="btn-secondary">Practice Lab</Link>}
            </div>

            {/* Commitment CTA — shown only before commit */}
            {!committed && prog.visited === 0 && (
              <button
                onClick={handleCommit}
                className="mt-4 flex items-center gap-2 text-sm transition-all hover:opacity-90"
                style={{ color: 'rgba(56,189,248,0.6)' }}
              >
                <div className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: 'rgba(56,189,248,0.4)' }}>
                </div>
                I commit to finishing this course
              </button>
            )}
            {committed && prog.visited === 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: 'rgba(56,189,248,0.55)' }}>
                <CheckCircle2 size={14} style={{ color: '#38bdf8' }} />
                <span>Committed. Chapter 1 is waiting.</span>
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <GifCard gifId={HERO_OPTIONS[heroIdx].id} caption={HERO_OPTIONS[heroIdx].caption} tooltip={HERO_OPTIONS[heroIdx].tooltip} side="right" />
          </div>
        </div>
      </motion.div>

      {/* Progress */}
      {prog.pct > 0 && (
        <motion.div variants={item} className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-100">Your Progress</h3>
            <div className="flex items-center gap-3">
              {streak > 1 && (
                <span className="text-xs font-bold" style={{ color: '#f97316' }}>🔥 {streak}-day streak</span>
              )}
              <button onClick={reset} className="text-xs text-slate-400 hover:text-red-400 transition-colors">Reset</button>
            </div>
          </div>
          <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div className="h-full bg-mblue-600 rounded-full" initial={{ width: 0 }} animate={{ width: `${prog.pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
          </div>
          <div className="flex justify-between text-sm text-slate-500">
            <span>{prog.visited}/{prog.total} chapters read</span>
            <span className="font-bold text-mblue-600">{prog.pct}% complete</span>
            <span>{prog.quizzes}/{prog.total} quizzes passed</span>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <div key={i} className="card text-center">
            <div className="w-10 h-10 bg-mblue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <s.icon size={20} className="text-mblue-600" />
            </div>
            <div className="font-bold text-slate-100">{s.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </motion.div>

      {/* Why it matters */}
      <motion.div variants={item} className="bg-gradient-to-r from-navy-700 to-mblue-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><ScanSearch size={20} className="flex-shrink-0" /> Why Wireshark Is the Ground Truth of OT Networks</h2>
            <ul className="text-sm text-blue-100 space-y-1 list-none">
              <li className="flex items-center gap-2"><Network size={13} className="flex-shrink-0" /> Decodes Modbus, DNP3, OPC UA, and EtherNet/IP natively — no plugins needed</li>
              <li className="flex items-center gap-2"><Shield size={13} className="flex-shrink-0" /> Finds cleartext credentials, missing encryption, and malformed frames instantly</li>
              <li className="flex items-center gap-2"><Wifi size={13} className="flex-shrink-0" /> Protocol issues that take days to diagnose by guessing take minutes with a pcap</li>
              <li className="flex items-center gap-2"><Zap size={13} className="flex-shrink-0" /> Required skill for GICSP, ICS security assessments, and OT network commissioning</li>
            </ul>
          </div>
          <div className="flex-shrink-0 text-center">
            <div className="text-5xl font-black text-amber-400">Free</div>
            <div className="text-blue-200 text-sm">The best tool costs nothing</div>
            <div className="text-xs text-blue-300 mt-1">4 million+ downloads per year</div>
          </div>
        </div>
      </motion.div>

      {/* Chapter grid — 4-dot progress */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: '#38bdf8' }}>Chapters</h2>
          {prog.visited > 0 && (
            <span className="text-xs text-slate-500">
              {chaptersOnly.filter(ch => getChapterStatus(ch.id).visited).length} of {chaptersOnly.length} visited
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {chaptersOnly.map((ch) => {
            const ChIcon = ICON_MAP[ch.icon] || BookOpen
            const status = getChapterStatus(ch.id)
            const allFour = status.level1Passed && status.level2Passed && status.level3Passed && status.level4Passed
            return (
              <Link key={ch.id} to={ch.path} className="card flex items-center gap-4 hover:border-mblue-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: allFour
                      ? 'rgba(74,222,128,0.15)'
                      : status.visited
                        ? 'rgba(56,189,248,0.12)'
                        : 'rgba(56,189,248,0.06)',
                  }}>
                  <ChIcon size={20} style={{ color: allFour ? '#4ade80' : status.visited ? '#38bdf8' : 'rgba(56,189,248,0.5)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-100 group-hover:text-sky-400 transition-colors truncate">{ch.label}</div>
                  {status.visited && (
                    <div className="flex items-center gap-1 mt-1">
                      {[
                        { key: 'level1Passed', color: '#34d399' },
                        { key: 'level2Passed', color: '#fbbf24' },
                        { key: 'level3Passed', color: '#f87171' },
                        { key: 'level4Passed', color: '#4ade80' },
                      ].map((dot) => (
                        <div key={dot.key} className="w-1.5 h-1.5 rounded-full"
                          style={{ background: status[dot.key] ? dot.color : 'rgba(255,255,255,0.12)' }} />
                      ))}
                      <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {allFour ? 'complete' : 'in progress'}
                      </span>
                    </div>
                  )}
                </div>
                {allFour
                  ? <CheckCircle2 size={16} style={{ color: '#4ade80' }} className="flex-shrink-0" />
                  : <ArrowRight size={16} className="text-slate-300 group-hover:text-sky-400 transition-colors flex-shrink-0" />
                }
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* Training */}
      <motion.div variants={item}>
        <TrainingPanel course="wireshark" />
      </motion.div>

      {/* Footer motivator — loss framing when in progress */}
      <motion.div variants={item} className="text-center py-4">
        {prog.visited > 0 && prog.pct < 100 ? (
          <p className="text-slate-400 text-sm italic">
            "{chaptersOnly.length - prog.visited} chapters left to finish. Don't leave them unread."
          </p>
        ) : prog.pct === 100 ? (
          <p className="text-slate-400 text-sm italic">
            "You finished. The network doesn't lie — and now you know how to make it talk."
          </p>
        ) : (
          <p className="text-slate-400 text-sm italic">
            "The network doesn't lie. Wireshark just makes it tell the truth out loud."
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}
