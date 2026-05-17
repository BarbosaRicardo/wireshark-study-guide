import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { X, ExternalLink, BookOpen, Award, Calendar, Monitor, MapPin, Layers, AlertCircle } from 'lucide-react'

const FORMAT_ICON = {
  online: <Monitor size={12} className="text-blue-400" />,
  'in-person': <MapPin size={12} className="text-amber-400" />,
  hybrid: <Layers size={12} className="text-purple-400" />,
  'self-paced': <BookOpen size={12} className="text-green-400" />,
}

const FORMAT_LABEL = {
  online: 'Online',
  'in-person': 'In Person',
  hybrid: 'Hybrid',
  'self-paced': 'Self-Paced',
}

function formatDate(d) {
  if (!d) return null
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TrainingModal({ course, onClose }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    supabase
      .from('training_events')
      .select('*')
      .eq('course', course)
      .or(`end_date.gte.${today},end_date.is.null`)
      .order('is_cert', { ascending: false })
      .order('start_date', { ascending: true, nullsFirst: false })
      .then(({ data }) => {
        setEvents(data || [])
        setLoading(false)
      })
  }, [course])

  const certs = events.filter(e => e.is_cert)
  const trainings = events.filter(e => !e.is_cert)

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md h-full overflow-y-auto flex flex-col shadow-2xl"
        style={{ background: '#0c1526', borderLeft: '1px solid rgba(59,130,246,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: '#0c1526', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}>
              <BookOpen size={14} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">Training &amp; Certifications</p>
              <p className="text-xs text-slate-500">Upcoming events · always-on resources</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-500 text-sm">Loading events…</div>
            </div>
          )}

          {!loading && events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
              <AlertCircle size={20} className="text-slate-600" />
              <p className="text-slate-500 text-sm">No upcoming events right now. Check back soon.</p>
            </div>
          )}

          {/* Certifications */}
          {!loading && certs.length > 0 && (
            <section>
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(251,191,36,0.7)' }}>
                <Award size={12} className="text-amber-400" />
                Certifications
              </h4>
              <div className="space-y-2">
                {certs.map(e => (
                  <a
                    key={e.id}
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 group transition-all"
                    style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)' }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-amber-300 transition-colors truncate">
                        {e.cert_name || e.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{e.provider}</p>
                      <p className="text-xs mt-1" style={{ color: 'rgba(245,158,11,0.6)' }}>Self-paced · Always available</p>
                    </div>
                    <ExternalLink size={13} className="text-slate-600 group-hover:text-amber-400 flex-shrink-0 transition-colors" />
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Training */}
          {!loading && trainings.length > 0 && (
            <section>
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(59,130,246,0.7)' }}>
                <Calendar size={12} className="text-blue-400" />
                Upcoming Training
              </h4>
              <div className="space-y-2">
                {trainings.map(e => {
                  const start = formatDate(e.start_date)
                  const end = formatDate(e.end_date)
                  const dateStr = start
                    ? (end && end !== start ? `${start} – ${end}` : start)
                    : 'Always available'
                  return (
                    <a
                      key={e.id}
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start justify-between gap-3 rounded-xl px-4 py-3 group transition-all"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-200 group-hover:text-blue-300 transition-colors leading-snug">
                          {e.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{e.provider}</p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            {FORMAT_ICON[e.format]}
                            {FORMAT_LABEL[e.format]}
                          </span>
                          <span className="text-xs text-slate-500">{dateStr}</span>
                        </div>
                      </div>
                      <ExternalLink size={13} className="text-slate-600 group-hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors" />
                    </a>
                  )
                })}
              </div>
            </section>
          )}
        </div>

        {/* Footer note */}
        <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs text-slate-600 text-center">
            Events update automatically every Monday. Past events disappear.
          </p>
        </div>
      </div>
    </div>
  )
}
