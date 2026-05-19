import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBadges } from '../hooks/useBadges'
import { GUIDE_KEY } from '../data/badges'

const SEEN_KEY = `${GUIDE_KEY}_badges_seen`
const loadSeen = () => { try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]') } catch { return [] } }

// ── Icon library (Lucide 24×24 space) ────────────────────────────────────────
function Icon({ id, color, sw }) {
  const p = { fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (id) {
    case 'zap':
      return <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill={color} />
    case 'layers':
      return (
        <>
          <polygon points="12,2 2,7 12,12 22,7" {...p} />
          <polyline points="2,17 12,22 22,17" {...p} />
          <polyline points="2,12 12,17 22,12" {...p} />
        </>
      )
    case 'wrench':
      return (
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" {...p} />
      )
    case 'book':
      return (
        <>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" {...p} />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" {...p} />
        </>
      )
    case 'flame':
      return (
        <path d="M8.5 14.5A5 5 0 0 0 15 10c0-5-4-8.5-6-10 0 0 1.5 4 1.5 7.5-2 0-4.5-2-4.5-4.5C5 7 3 11 3 15a9 9 0 0 0 18 0c0-6-4.5-10-4.5-10-1.5 4-2 9-8 9.5Z" {...p} />
      )
    case 'shield':
      return (
        <>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...p} />
          {/* inner zap scaled & centred inside the shield */}
          <g transform="translate(7.4,7.4) scale(0.38)">
            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill={color} />
          </g>
        </>
      )
    default:
      return null
  }
}

// ── Flat-top hexagon helper ───────────────────────────────────────────────────
function hexPoints(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
  }).join(' ')
}

// ── BadgeHex ─────────────────────────────────────────────────────────────────
export function BadgeHex({ badge, earned, size = 40, tooltip = true }) {
  const [hov, setHov] = useState(false)

  const cx = size / 2
  const cy = size / 2
  const r  = size / 2 - 1.5
  const pts = hexPoints(cx, cy, r)

  // inner ring (subtle depth on earned badge)
  const innerPts = hexPoints(cx, cy, r * 0.8)

  // icon scaled into the badge
  const iconSize  = size * 0.44
  const iconOff   = (size - iconSize) / 2
  const iconScale = iconSize / 24
  const sw        = Math.max(1.2, 2.2 / iconScale)  // apparent stroke ≈ 2.2 px

  return (
    <div
      style={{ position: 'relative', display: 'inline-block', cursor: earned ? 'default' : 'default' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          overflow: 'visible',
          filter: earned
            ? `drop-shadow(0 0 ${(size * 0.13).toFixed(0)}px ${badge.color}bb)`
            : 'none',
          transition: 'filter 0.3s',
        }}
      >
        {/* Hex fill */}
        <polygon
          points={pts}
          fill={badge.color}
          fillOpacity={earned ? 0.14 : 0.04}
          stroke={earned ? badge.color : 'rgba(255,255,255,0.18)'}
          strokeWidth={earned ? 1.5 : 0.8}
          strokeOpacity={earned ? 0.9 : 0.35}
        />

        {/* Inner highlight (gives badge a bevelled coin look) */}
        {earned && (
          <polygon
            points={innerPts}
            fill="none"
            stroke="white"
            strokeWidth={0.6}
            strokeOpacity={0.12}
          />
        )}

        {/* Icon */}
        <g
          transform={`translate(${iconOff.toFixed(2)},${iconOff.toFixed(2)}) scale(${iconScale.toFixed(4)})`}
          opacity={earned ? 1 : 0.13}
        >
          <Icon id={badge.icon} color={badge.color} sw={sw} />
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && hov && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-7px)',
            background: 'rgba(10,16,30,0.97)',
            border: `1px solid ${earned ? badge.color + '44' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 8,
            padding: '7px 11px',
            whiteSpace: 'nowrap',
            zIndex: 300,
            pointerEvents: 'none',
            maxWidth: 220,
            whiteSpace: 'normal',
          }}
        >
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: earned ? badge.color : 'rgba(255,255,255,0.45)', marginBottom: 3 }}>
            {earned ? '✓ ' : ''}{badge.name}
          </div>
          <div style={{ fontSize: '0.6rem', color: earned ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)', lineHeight: 1.4 }}>
            {earned ? badge.desc : badge.hint}
          </div>
        </div>
      )}
    </div>
  )
}

// ── BadgeModal (default export) ───────────────────────────────────────────────
export default function BadgeModal() {
  const { earnedIds, badges } = useBadges()
  const [seen,    setSeen]    = useState(loadSeen)
  const [current, setCurrent] = useState(null)

  useEffect(() => {
    if (current) return
    const next = badges.find(b => earnedIds.includes(b.id) && !seen.includes(b.id))
    if (next) setCurrent(next)
  }, [earnedIds.join(','), seen.join(','), current, badges])

  const dismiss = useCallback(() => {
    if (!current) return
    const next = [...seen, current.id]
    localStorage.setItem(SEEN_KEY, JSON.stringify(next))
    setSeen(next)
    setCurrent(null)
  }, [current, seen])

  // keyboard dismiss
  useEffect(() => {
    if (!current) return
    const h = (e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') dismiss() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [current, dismiss])

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={dismiss}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.78)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0.45, opacity: 0, y: 32 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{    scale: 0.85, opacity: 0         }}
            transition={{ type: 'spring', damping: 20, stiffness: 280 }}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              background: 'linear-gradient(165deg, rgba(18,26,46,0.99) 0%, rgba(8,12,22,1) 100%)',
              border: `1px solid ${current.color}28`,
              borderRadius: 22,
              padding: '40px 44px 36px',
              maxWidth: 340,
              width: '90vw',
              textAlign: 'center',
              boxShadow: `0 0 80px ${current.glow}, 0 30px 60px rgba(0,0,0,0.7)`,
              overflow: 'hidden',
            }}
          >
            {/* Ambient glow behind badge */}
            <motion.div
              animate={{ opacity: [0.35, 0.65, 0.35], scale: [0.85, 1.1, 0.85] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -60%)',
                width: 260, height: 260,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${current.glow} 0%, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />

            {/* "Achievement Unlocked" label */}
            <div style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: current.color,
              marginBottom: 22,
              opacity: 0.9,
            }}>
              Achievement Unlocked
            </div>

            {/* Badge (slow-pulse scale) */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: 'flex', justifyContent: 'center', marginBottom: 26, position: 'relative' }}
            >
              <BadgeHex badge={current} earned size={118} tooltip={false} />
            </motion.div>

            {/* Name */}
            <div style={{
              fontSize: '1.55rem',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              marginBottom: 10,
            }}>
              {current.name}
            </div>

            {/* Desc */}
            <div style={{
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.62)',
              lineHeight: 1.55,
              marginBottom: 10,
            }}>
              {current.desc}
            </div>

            {/* Flavor */}
            <div style={{
              fontSize: '0.74rem',
              color: current.color + 'aa',
              fontStyle: 'italic',
              lineHeight: 1.45,
              marginBottom: 28,
            }}>
              "{current.flavor}"
            </div>

            {/* CTA */}
            <button
              onClick={dismiss}
              style={{
                width: '100%',
                background: current.color,
                color: '#080c16',
                border: 'none',
                borderRadius: 11,
                padding: '11px 0',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                letterSpacing: '0.01em',
                boxShadow: `0 0 20px ${current.glow}`,
              }}
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
