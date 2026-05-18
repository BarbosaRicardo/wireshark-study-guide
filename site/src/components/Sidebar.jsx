import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Menu, X, ScanSearch, BarChart2, Home,
  Wifi, Filter, Layers, Network, Zap, Globe, Shield, Terminal, FlaskConical, CreditCard, LayoutGrid, LogIn, LogOut
, FileText, ChevronDown, Code2, Sliders, Server, LayoutDashboard, GraduationCap, CheckCircle2 } from 'lucide-react'
import { CHAPTERS } from '../data/chapters'
import { useProgress } from '../hooks/useProgress'
import { supabase } from '../lib/supabase'
import QuizReport from './QuizReport'
import TrainingModal from './TrainingModal'

const ICON_MAP = {
  ScanSearch, Wifi, Filter, Layers, Network, Zap, Globe, Shield, Terminal, FlaskConical, CreditCard,
}

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [session, setSession] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [showGuides, setShowGuides] = useState(false)
  const [showChapters, setShowChapters] = useState(false)
  const [showTraining, setShowTraining] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setSessionLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  function resolveEmail(input) {
    const t = input.trim()
    return t.includes('@') ? t : `${t}@scadahub.io`
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: resolveEmail(loginEmail),
      password: loginPassword,
    })
    setLoginLoading(false)
    if (error) { setLoginError(error.message) } else { setShowLogin(false) }
  }

  const { getChapterStatus, overallProgress } = useProgress()
  const prog = overallProgress()

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

  const READ_TIME = {
    intro: 10, capture: 12, filters: 14, dissectors: 12,
    modbus: 14, dnp3: 12, opcua: 12, security: 14, advanced: 16, lab: 20,
  }

  const chaptersOnly = CHAPTERS.filter(ch => ch.id !== 'home' && ch.id !== 'flashcards')
  const totalChapters = chaptersOnly.length

  const completedCount = chaptersOnly.filter(ch => {
    const s = getChapterStatus(ch.id)
    return s.level1Passed && s.level2Passed && s.level3Passed && s.level4Passed
  }).length
  const remaining = totalChapters - completedCount

  const nextChapterId = chaptersOnly.find(ch => !getChapterStatus(ch.id).level1Passed)?.id

  const NavItem = ({ ch }) => {
    const status = getChapterStatus(ch.id)
    const Icon = ICON_MAP[ch.icon] || ScanSearch
    const isNext = ch.id === nextChapterId
    const readTime = READ_TIME[ch.id]

    const colonIdx = ch.label.indexOf(': ')
    const prefix = colonIdx !== -1 ? ch.label.slice(0, colonIdx + 1) : null
    const topic  = colonIdx !== -1 ? ch.label.slice(colonIdx + 2) : ch.label

    const filledCount = [status.level1Passed, status.level2Passed, status.level3Passed].filter(Boolean).length
    const nearComplete = filledCount > 0 && filledCount < 3

    return (
      <div>
        <NavLink
          to={ch.path}
          onClick={() => setOpen(false)}
          className={({ isActive }) => `chapter-nav-item ${isActive ? 'active' : ''}`}
        >
          <Icon size={15} className="flex-shrink-0 opacity-70" />
          <span className="flex-1 truncate">
            {prefix && <span className="opacity-40 font-normal mr-1 text-xs">{prefix}</span>}
            <span className="font-semibold">{topic}</span>
          </span>
          <div className="flex gap-0.5 flex-shrink-0 items-center">
            {status.completed ? (
              <CheckCircle2 size={13} className="text-emerald-400" />
            ) : (
              <>
                <div className={`rounded-full transition-all ${
                  status.level1Passed
                    ? 'w-1.5 h-1.5 bg-emerald-400 shadow-glow-green'
                    : nearComplete
                      ? 'w-2 h-2 bg-white/15'
                      : status.visited
                        ? 'w-1.5 h-1.5 bg-amber-400'
                        : 'w-1.5 h-1.5 bg-white/10'
                }`}
                  style={!status.level1Passed && nearComplete ? { boxShadow: '0 0 5px rgba(45,212,191,0.4)' } : {}}
                />
                <div className={`rounded-full transition-all ${
                  status.level2Passed
                    ? 'w-1.5 h-1.5 bg-amber-400'
                    : nearComplete && filledCount >= 1
                      ? 'w-2 h-2 bg-white/15'
                      : 'w-1.5 h-1.5 bg-white/10'
                }`}
                  style={!status.level2Passed && nearComplete && filledCount >= 1 ? { boxShadow: '0 0 5px rgba(45,212,191,0.4)' } : {}}
                />
                <div className={`rounded-full transition-all ${
                  status.level3Passed
                    ? 'w-1.5 h-1.5 bg-rose-400'
                    : nearComplete && filledCount >= 2
                      ? 'w-2 h-2 bg-white/15'
                      : 'w-1.5 h-1.5 bg-white/10'
                }`}
                  style={!status.level3Passed && nearComplete && filledCount >= 2 ? { boxShadow: '0 0 5px rgba(45,212,191,0.4)' } : {}}
                />
              </>
            )}
          </div>
        </NavLink>
        {(isNext || (!status.visited && readTime)) && (
          <div className="ml-9 mb-0.5 mt-0.5 flex items-center gap-2">
            {isNext && (
              <span className="font-semibold tracking-wide" style={{ color: '#2dd4bf', fontSize: '0.65rem' }}>▶ Up next</span>
            )}
            {!status.visited && readTime && (
              <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.6rem' }}>~{readTime} min</span>
            )}
          </div>
        )}
      </div>
    )
  }
  const HomeItem = () => (
    <NavLink
      to="/"
      end
      onClick={() => setOpen(false)}
      className={({ isActive }) => `chapter-nav-item ${isActive ? 'active' : ''}`}
    >
      <Home size={15} className="flex-shrink-0 opacity-70" />
      <span className="flex-1 truncate">Course Home</span>
    </NavLink>
  )
  const AllGuidesItem = () => {
    const isGH = import.meta.env.BASE_URL !== '/'
    const guideUrl = (slug) => isGH
      ? `https://barbosaricardo.github.io/${slug}-study-guide/`
      : `https://${slug}-study-guide.vercel.app/`
    const hubUrl = 'https://scada-hub.vercel.app'
    const GUIDE_LIST = [
      { name: 'Modbus', slug: 'modbus', color: '#60a5fa', Icon: Network },
      { name: 'OPC UA', slug: 'opcua', color: '#a78bfa', Icon: Globe },
      { name: 'DNP3', slug: 'dnp3', color: '#fbbf24', Icon: Zap },
      { name: 'IEC 61131-3', slug: 'iec61131', color: '#2dd4bf', Icon: Code2 },
      { name: 'PID Controllers', slug: 'pid', color: '#4ade80', Icon: Sliders },
      { name: 'SEL RTAC', slug: 'rtac', color: '#818cf8', Icon: Server },
      { name: 'Ignition SCADA', slug: 'ignition', color: '#fb923c', Icon: LayoutDashboard },
      { name: 'Wireshark', slug: 'wireshark', color: '#38bdf8', Icon: ScanSearch },
    ]
    return (
      <div>
        <button
          onClick={() => setShowGuides(g => !g)}
          className="chapter-nav-item w-full"
        >
          <LayoutGrid size={15} className="flex-shrink-0 opacity-70" />
          <span className="flex-1 text-left">All Courses</span>
          <ChevronDown size={13} className="flex-shrink-0 opacity-50 transition-transform" style={{ transform: showGuides ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </button>
        {showGuides && (
          <div className="ml-2 mt-0.5 space-y-0.5">
            {GUIDE_LIST.map((g) => (
              <a
                key={g.name}
                href={guideUrl(g.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: g.color + '22' }}>
                  <g.Icon size={11} style={{ color: g.color }} />
                </div>
                <span className="truncate">{g.name}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    )
  }



  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(false)}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 lg:cursor-default"
            style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', boxShadow: '0 0 20px rgba(14,165,233,0.45)' }}>
            <ScanSearch size={18} className="text-white" />
          </button>
          <div>
            <div className="font-black text-white text-sm tracking-wide leading-tight">Wireshark</div>
            <div className="text-xs font-medium" style={{ color: '#38bdf8' }}>Study Guide</div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-500">Overall Progress</span>
            <span className="font-bold" style={{ color: '#38bdf8' }}>{prog.pct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="progress-bar h-full" style={{ width: `${prog.pct}%` }} />
          </div>
          {streak > 1 && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <span style={{ fontSize: '0.7rem' }}>🔥</span>
              <span className="text-xs font-bold" style={{ color: '#f97316' }}>{streak}-day streak</span>
              <span className="text-xs" style={{ color: 'rgba(249,115,22,0.4)' }}>— don't break it</span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between text-xs">
            <div className="flex gap-3">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />L1: {prog.l1 || 0}</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />L2: {prog.l2 || 0}</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />L3: {prog.l3 || 0}</span>
            </div>
            <span className="font-medium transition-colors" style={{ color: remaining === 0 ? '#4ade80' : '#64748b' }}>
              {remaining === 0
                ? 'All done ✓'
                : completedCount === 0
                  ? `${totalChapters} to finish`
                  : `${remaining} left`}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        <HomeItem />
        <AllGuidesItem />
        <div>
          <button
            onClick={() => setShowChapters(c => !c)}
            className="chapter-nav-item w-full"
          >
            <BookOpen size={15} className="flex-shrink-0 opacity-70" />
            <span className="flex-1 text-left">Chapters</span>
            <ChevronDown size={13} className="flex-shrink-0 opacity-50 transition-transform" style={{ transform: showChapters ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>
          {showChapters && (
            <div className="ml-1 space-y-0.5 mt-0.5">
              {CHAPTERS.filter(ch => ch.id !== 'home' && ch.id !== 'flashcards').map((ch) => (
                <NavItem key={ch.id} ch={ch} />
              ))}
            </div>
          )}
        </div>
        <div className="pt-2 border-t border-white/5 mt-2">
          <NavLink
            to="/flashcards"
            onClick={() => setOpen(false)}
            className={({ isActive }) => `chapter-nav-item ${isActive ? 'active' : ''}`}
          >
            <CreditCard size={15} className="text-violet-400 flex-shrink-0" />
            <span className="flex-1 truncate font-semibold">Flashcards</span>
          </NavLink>
          <button
            onClick={() => setShowTraining(true)}
            className="chapter-nav-item w-full mt-0.5"
          >
            <GraduationCap size={15} className="text-blue-400 flex-shrink-0" />
            <span className="flex-1 text-left truncate font-semibold">More Training</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full text-blue-400"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
              LIVE
            </span>
          </button>
        </div>
      </nav>
            {/* Footer */}
      <div className="p-4 space-y-3" style={{ borderTop: '1px solid rgba(14,165,233,0.12)' }}>
        <a
          href={`${import.meta.env.BASE_URL}study_guide.pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl text-white text-xs font-bold transition-all"
          style={{ background: 'linear-gradient(135deg,#0284c7,#0ea5e9)', boxShadow: '0 0 14px rgba(14,165,233,0.35)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          Download PDF Study Guide
        </a>
        <a
          href={`${import.meta.env.BASE_URL}syllabus.pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{ background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.18)', color: 'rgba(14,165,233,0.7)' }}
        >
          <FileText size={12} />
          Course Syllabus
        </a>
        <a
          href={'https://scada-hub.vercel.app'}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{ background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.18)', color: 'rgba(14,165,233,0.7)' }}
        >
          <LayoutGrid size={12} />
          ← SCADA Hub
        </a>
        <button
          onClick={() => { setOpen(false); setReportOpen(true) }}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{ background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.18)', color: 'rgba(14,165,233,0.7)' }}
        >
          <BarChart2 size={12} />
          Quiz Results
        </button>

        <p className="text-center text-xs" style={{ color: 'rgba(14,165,233,0.35)' }}>
          Wireshark · IEEE 802 · May 2026
        </p>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 text-white rounded-xl flex items-center justify-center shadow-lg"
        style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)' }}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 h-screen sticky top-0 overflow-hidden glass">
        <SidebarContent />
      </aside>

      <aside className={`lg:hidden fixed left-0 top-0 h-full w-72 z-50 shadow-2xl glass transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {reportOpen && <QuizReport onClose={() => setReportOpen(false)} />}
      {showTraining && <TrainingModal course="wireshark" onClose={() => setShowTraining(false)} />}
    </>
  )
}
