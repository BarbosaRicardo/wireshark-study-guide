import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ExternalLink, BookOpen, Award, ChevronDown, ChevronUp, Calendar, Monitor, MapPin, Layers } from 'lucide-react'

const FORMAT_ICON = {
  online: <Monitor size={13} className="text-blue-400" />,
  'in-person': <MapPin size={13} className="text-amber-400" />,
  hybrid: <Layers size={13} className="text-purple-400" />,
  'self-paced': <BookOpen size={13} className="text-green-400" />,
}

const FORMAT_LABEL = {
  online: 'Online',
  'in-person': 'In Person',
  hybrid: 'Hybrid',
  'self-paced': 'Self-Paced',
}

function formatDate(d) {
  if (!d) return 'Always available'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TrainingPanel({ course }) {
  const [open, setOpen] = useState(false)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    if (!open || fetched) return
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    supabase
      .from('training_events')
      .select('*')
      .eq('course', course)
      .or(`end_date.gte.${today},end_date.is.null`)
      .order('start_date', { ascending: true, nullsFirst: false })
      .then(({ data }) => {
        setEvents(data || [])
        setFetched(true)
        setLoading(false)
      })
  }, [open, course, fetched])

  const certs = events.filter(e => e.is_cert)
  const trainings = events.filter(e => !e.is_cert)

  return (
    <div
      className="mt-8 rounded-xl overflow-hidden border"
      style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/5"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <BookOpen size={16} className="text-blue-400" />
          More Training &amp; Certifications
        </span>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {loading && (
            <p className="text-slate-500 text-sm py-4 text-center">Loading…</p>
          )}

          {!loading && events.length === 0 && (
            <p className="text-slate-500 text-sm py-4 text-center">No upcoming events found. Check back soon.</p>
          )}

          {!loading && certs.length > 0 && (
            <div className="mb-5">
              <h4 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                <Award size={13} className="text-amber-400" /> Certifications
              </h4>
              <div className="flex flex-col gap-2">
                {certs.map(e => (
                  <a
                    key={e.id}
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between gap-3 rounded-lg px-4 py-3 group transition-colors hover:bg-white/5"
                    style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-amber-300 transition-colors truncate">{e.cert_name || e.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{e.provider}</p>
                    </div>
                    <ExternalLink size={14} className="text-slate-500 group-hover:text-amber-400 flex-shrink-0 mt-0.5 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {!loading && trainings.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                <Calendar size={13} className="text-blue-400" /> Upcoming Training
              </h4>
              <div className="flex flex-col gap-2">
                {trainings.map(e => (
                  <a
                    key={e.id}
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between gap-3 rounded-lg px-4 py-3 group transition-colors hover:bg-white/5"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-blue-300 transition-colors">{e.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{e.provider}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          {FORMAT_ICON[e.format]}
                          {FORMAT_LABEL[e.format]}
                        </span>
                        {e.start_date && (
                          <span className="text-xs text-slate-500">
                            {formatDate(e.start_date)}{e.end_date && e.end_date !== e.start_date ? ` – ${formatDate(e.end_date)}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-slate-500 group-hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
