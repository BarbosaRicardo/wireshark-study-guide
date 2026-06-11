import React, { useState } from 'react'
import { ClipboardCheck, ChevronDown, ChevronUp } from 'lucide-react'
import { MATRIX_MAP, TRACKS } from '../data/matrixMap'

// "This chapter is on the company skills matrix" strip.
// Collapsed: track/week chips. Expanded: the exact competency lines covered.
export default function MatrixBadge({ chapterId }) {
  const [open, setOpen] = useState(false)
  const entries = MATRIX_MAP[chapterId]
  if (!entries?.length) return null

  return (
    <div className="panel mb-2" style={{ borderColor: 'rgba(255,180,84,0.35)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left cursor-pointer"
        aria-expanded={open}
      >
        <ClipboardCheck size={14} style={{ color: '#ffb454' }} className="flex-shrink-0" />
        <span className="readout" style={{ color: '#ffb454' }}>
          On the company skills matrix
        </span>
        <span className="flex flex-wrap gap-1.5 ml-1">
          {entries.map((e, i) => (
            <span
              key={i}
              className="readout px-1.5 py-0.5"
              style={{
                color: TRACKS[e.track].color,
                border: `1px solid ${TRACKS[e.track].color}55`,
              }}
            >
              {TRACKS[e.track].label} · WK {e.week}
            </span>
          ))}
        </span>
        <span className="ml-auto flex-shrink-0" style={{ color: 'rgba(255,180,84,0.6)' }}>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: 'rgba(255,180,84,0.15)' }}>
          {entries.map((e, i) => (
            <div key={i} className="mt-3">
              <p className="readout mb-1.5" style={{ color: TRACKS[e.track].color }}>
                {TRACKS[e.track].label} · WEEK {e.week} · {e.category}
              </p>
              <ul className="space-y-1">
                {e.skills.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
                    <span className="mt-1.5 w-1 h-1 flex-shrink-0" style={{ background: '#ffb454' }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-[11px] text-slate-600 mt-3 italic">
            These competencies come straight from the survey your training plan is graded against.
            Pass this chapter's quizzes and you can check them off.
          </p>
        </div>
      )}
    </div>
  )
}
