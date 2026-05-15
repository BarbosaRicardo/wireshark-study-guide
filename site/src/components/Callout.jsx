import React from 'react'
import { Lightbulb, AlertTriangle, FlaskConical, Star, Cpu } from 'lucide-react'

const TYPES = {
  key: {
    icon: Lightbulb,
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.3)',
    glow: 'rgba(59,130,246,0.15)',
    text: '#93c5fd',
    label: '#60a5fa',
    iconBg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    title: 'Key Concept',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'rgba(249,115,22,0.08)',
    border: 'rgba(249,115,22,0.3)',
    glow: 'rgba(249,115,22,0.12)',
    text: '#fdba74',
    label: '#fb923c',
    iconBg: 'linear-gradient(135deg, #f97316, #ea580c)',
    title: 'Warning',
  },
  example: {
    icon: FlaskConical,
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.3)',
    glow: 'rgba(16,185,129,0.12)',
    text: '#6ee7b7',
    label: '#34d399',
    iconBg: 'linear-gradient(135deg, #10b981, #059669)',
    title: 'Example',
  },
  pro: {
    icon: Star,
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.3)',
    glow: 'rgba(245,158,11,0.12)',
    text: '#fcd34d',
    label: '#fbbf24',
    iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
    title: 'Pro Tip',
  },
  field: {
    icon: Cpu,
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.3)',
    glow: 'rgba(239,68,68,0.12)',
    text: '#fca5a5',
    label: '#f87171',
    iconBg: 'linear-gradient(135deg, #ef4444, #dc2626)',
    title: '⚠️ Field Gotcha',
  },
}

export default function Callout({ type = 'key', title, children }) {
  const t = TYPES[type] || TYPES.key
  const Icon = t.icon

  return (
    <div
      className="rounded-2xl p-5 my-5"
      style={{
        background: t.bg,
        border: `1px solid ${t.border}`,
        boxShadow: `0 4px 24px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: t.iconBg, boxShadow: `0 0 12px ${t.glow}` }}
        >
          <Icon size={16} className="text-white" />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: t.label }}>
            {title || t.title}
          </div>
          <div className="text-sm leading-relaxed" style={{ color: t.text }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
