import React, { useState } from 'react'
import { X, Download, Trash2, RefreshCw, CheckCircle2, XCircle, BarChart2, Loader2, AlertCircle } from 'lucide-react'
import { useQuizReport } from '../hooks/useQuizReport'
import { CHAPTERS } from '../data/chapters'

const LEVEL_LABEL = { 1: 'L1 · Foundations', 2: 'L2 · Applied', 3: 'L3 · Graduate' }

function chapterLabel(id) {
  return CHAPTERS.find(c => c.id === id)?.label ?? id.charAt(0).toUpperCase() + id.slice(1)
}

function fmtDate(val) {
  const d = new Date(val)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function exportCSV(submissions) {
  const header = 'Date,Chapter,Level,Score,Total,Pct,Passed,Attempt'
  const rows = submissions.map(s =>
    [fmtDate(s.created_at || s.ts), chapterLabel(s.chapter), `Level ${s.level}`, s.score, s.total, `${s.pct}%`, s.passed ? 'Pass' : 'Fail', s.attempt].join(',')
  )
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `quiz_report_${Date.now()}.csv`; a.click()
  URL.revokeObjectURL(url)
}

export default function QuizReport({ onClose }) {
  const { submissions, loading, error, refresh, clearLocal } = useQuizReport()
  const [confirmClear, setConfirmClear] = useState(false)

  const total = submissions.length
  const passed = submissions.filter(s => s.passed).length
  const avgPct = total ? Math.round(submissions.reduce((a, s) => a + s.pct, 0) / total) : 0
  const byLevel = [1, 2, 3].map(l => ({ level: l, count: submissions.filter(s => s.level === l).length }))

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl z-50 flex flex-col shadow-2xl overflow-hidden"
        style={{ background: 'rgba(6,14,26,0.98)', border: '1px solid rgba(255,255,255,0.08)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)' }}>
          <div className="flex items-center gap-3">
            <BarChart2 size={18} style={{ color: '#22d3ee' }} />
            <div>
              <div className="font-bold text-white text-sm">Quiz Report</div>
              <div className="text-xs text-slate-500">
                {loading ? 'Loading from Supabase…' : error ? 'Showing local cache' : `${total} submission${total !== 1 ? 's' : ''} · synced`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refresh} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-5 py-2 text-xs flex-shrink-0"
            style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
            <AlertCircle size={12} />
            Supabase unreachable — showing local cache. {error}
          </div>
        )}

        {!loading && total > 0 && (
          <div className="grid grid-cols-4 gap-px flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              { label: 'Total', value: total, color: '#22d3ee' },
              { label: 'Passed', value: passed, color: '#34d399' },
              { label: 'Avg Score', value: `${avgPct}%`, color: avgPct >= 70 ? '#34d399' : '#f87171' },
              { label: 'Pass Rate', value: `${total ? Math.round((passed / total) * 100) : 0}%`, color: '#a78bfa' },
            ].map(({ label, value, color }) => (
              <div key={label} className="px-4 py-3 text-center" style={{ background: 'rgba(6,14,26,0.9)' }}>
                <div className="text-xl font-black" style={{ color }}>{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        )}

        {!loading && total > 0 && (
          <div className="flex gap-4 px-5 py-2.5 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
            {byLevel.map(({ level, count }) => (
              <div key={level} className="flex items-center gap-1.5">
                <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{
                    background: level === 1 ? 'rgba(6,182,212,0.15)' : level === 2 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                    color: level === 1 ? '#22d3ee' : level === 2 ? '#fbbf24' : '#f87171',
                  }}>L{level}</span>
                <span className="text-xs text-slate-500">{count} attempt{count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full gap-2 text-slate-600">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Fetching from Supabase…</span>
            </div>
          ) : total === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
              <BarChart2 size={32} />
              <div className="text-sm font-medium">No quiz submissions yet</div>
              <div className="text-xs">Complete a quiz to see your history here.</div>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}>
                  {['Date', 'Chapter', 'Level', 'Score', '%', 'Status', 'Attempt'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((s, i) => (
                  <tr key={s.id} style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  }}>
                    <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{fmtDate(s.created_at || s.ts)}</td>
                    <td className="px-4 py-2.5 text-slate-300 font-medium">{chapterLabel(s.chapter)}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-1.5 py-0.5 rounded font-bold whitespace-nowrap"
                        style={{
                          background: s.level === 1 ? 'rgba(6,182,212,0.12)' : s.level === 2 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                          color: s.level === 1 ? '#22d3ee' : s.level === 2 ? '#fbbf24' : '#f87171',
                        }}>
                        {LEVEL_LABEL[s.level] ?? `Level ${s.level}`}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-300">{s.score}/{s.total}</td>
                    <td className="px-4 py-2.5 font-mono font-bold" style={{ color: s.pct >= 70 ? '#34d399' : '#f87171' }}>{s.pct}%</td>
                    <td className="px-4 py-2.5">
                      {s.passed
                        ? <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={12} />Pass</span>
                        : <span className="flex items-center gap-1 text-red-400"><XCircle size={12} />Fail</span>}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-500">#{s.attempt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)' }}>
          <button onClick={() => exportCSV(submissions)} disabled={total === 0 || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
            style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.3)', color: '#22d3ee' }}>
            <Download size={13} /> Export CSV
          </button>
          <button onClick={() => { if (confirmClear) { clearLocal(); setConfirmClear(false) } else setConfirmClear(true) }}
            disabled={total === 0 || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: confirmClear ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${confirmClear ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
              color: confirmClear ? '#f87171' : '#64748b',
            }}>
            <Trash2 size={13} />{confirmClear ? 'Confirm Clear Local' : 'Clear Local Cache'}
          </button>
          {confirmClear && <button onClick={() => setConfirmClear(false)} className="text-xs text-slate-600 hover:text-slate-400">Cancel</button>}
          <span className="ml-auto text-xs text-slate-700">Synced to Supabase</span>
        </div>
      </div>
    </>
  )
}
