import React from 'react'
import { useBadges } from '../hooks/useBadges'
import { BadgeHex } from './BadgeModal'

export default function BadgeTray() {
  const { earnedIds, badges } = useBadges()
  const count = earnedIds.length

  return (
    <div style={{
      padding: '12px 14px 10px',
      borderTop: '1px solid rgba(255,255,255,0.05)',
    }}>
      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <span style={{
          fontSize: '0.6rem',
          fontWeight: 700,
          letterSpacing: '0.13em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.28)',
        }}>
          Badges
        </span>
        <span style={{
          fontSize: '0.62rem',
          fontWeight: 600,
          color: count > 0 ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.18)',
        }}>
          {count}/{badges.length}
        </span>
      </div>

      {/* Badge grid */}
      <div style={{
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
      }}>
        {badges.map(b => (
          <BadgeHex
            key={b.id}
            badge={b}
            earned={earnedIds.includes(b.id)}
            size={32}
          />
        ))}
      </div>
    </div>
  )
}
