import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Menu, X, ScanSearch, BarChart2, Home,
  Wifi, Filter, Layers, Network, Zap, Globe, Shield, Terminal, FlaskConical, CreditCard, LayoutGrid, LogIn, LogOut
, FileText } from 'lucide-react'
import { CHAPTERS } from '../data/chapters'
import { useProgress } from '../hooks/useProgress'
import { supabase } from '../lib/supabase'
import QuizReport from './QuizReport'

const ICON_MAP = {
  ScanSearch, Wifi, Filter, Layers, Network, Zap, Globe, Shield, Terminal, FlaskConical, CreditCard,
}

export default function Sidebar() {
  const [open, setOpen] = useState(true)
  const [reportOpen, setReportOpen] = useState(false)
  const [session, setSession] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

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

  const NavItem = ({ ch }) => {
    const status = getChapterStatus(ch.id)
    const Icon = ICON_MAP[ch.icon] || ScanSearch
    return (
      <NavLink
        to={ch.path}
        onClick={() => setOpen(false)}
        className={({ isActive }) => `chapter-nav-item ${isActive ? 'active' : ''}`}
      >
        <Icon size={15} className="flex-shrink-0 opacity-70" />
        <span className="flex-1 truncate">{ch.label}</span>
        <div className="flex gap-0.5 flex-shrink-0">
          <div className={`w-1.5 h-1.5 rounded-full transition-all ${status.level1Passed ? 'bg-emerald-400 shadow-glow-green' : status.visited ? 'bg-amber-400' : 'bg-white/10'}`} />
          <div className={`w-1.5 h-1.5 rounded-full transition-all ${status.level2Passed ? 'bg-amber-400' : 'bg-white/10'}`} />
          <div className={`w-1.5 h-1.5 rounded-full transition-all ${status.level3Passed ? 'bg-rose-400' : 'bg-white/10'}`} />
        </div>
      </NavLink>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', boxShadow: '0 0 20px rgba(14,165,233,0.45)' }}>
            <ScanSearch size={18} className="text-white" />
          </div>
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
          <div className="mt-2 flex gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />L1: {prog.l1 || 0}</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />L2: {prog.l2 || 0}</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />L3: {prog.l3 || 0}</span>
            <span className="ml-auto text-slate-600">{prog.visited} read</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {CHAPTERS.map((ch) => (
          <NavItem key={ch.id} ch={ch} />
        ))}
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
          href="https://scada-hub.vercel.app"
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

        {!sessionLoading && (session ? (
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-xs truncate" style={{ color: 'rgba(14,165,233,0.5)' }}>{session.user.email}</span>
            <button onClick={() => supabase.auth.signOut()} title="Sign out" style={{ color: 'rgba(14,165,233,0.5)' }} className="hover:text-rose-400 transition flex-shrink-0">
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowLogin(!showLogin)}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.18)', color: 'rgba(14,165,233,0.7)' }}
            >
              <LogIn size={12} />
              {showLogin ? 'Cancel' : 'Sign In to Track Progress'}
            </button>
            {showLogin && (
              <form onSubmit={handleLogin} className="flex flex-col gap-1.5">
                {loginError && <p className="text-xs text-rose-400">{loginError}</p>}
                <input type="text" placeholder="username or email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  className="bg-slate-800/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-white/20" />
                <input type="password" placeholder="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  className="bg-slate-800/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-white/20" />
                <button type="submit" disabled={loginLoading}
                  className="font-bold rounded-lg px-3 py-1.5 text-xs transition text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#0284c7,#0ea5e9)' }}>
                  {loginLoading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            )}
          </>
        ))}
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
    </>
  )
}
