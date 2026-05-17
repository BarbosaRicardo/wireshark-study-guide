import React, { useState } from 'react'
import { GIFS } from '../data/gifs'

export default function GifCard({ gifKey, gifId, caption, side = 'right', className = '', tooltip = null }) {
  const [error, setError] = useState(false)
  const id = gifId || GIFS[gifKey]

  if (!id || error) return null

  const url = `https://media1.giphy.com/media/${id}/giphy.gif`

  return (
    <div className={`flex ${side === 'left' ? 'justify-start' : 'justify-end'} my-4 ${className}`}>
      <div style={{ width: 200 }} className="text-center">
        {/* group wrapper: no overflow:hidden so tooltip isn't clipped */}
        <div className="group" style={{ position: 'relative', width: 200, height: 150 }}>
          {/* image gets its own overflow:hidden for border-radius */}
          <div style={{
            position: 'absolute', inset: 0,
            overflow: 'hidden',
            borderRadius: '12px',
            border: '1px solid rgba(59,130,246,0.2)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}>
            <img
              src={url}
              alt={caption || gifKey}
              width="200"
              height="150"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              onError={() => setError(true)}
            />
          </div>
          {/* tooltip: scrollable, not clipped by parent */}
          {tooltip && (
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-y-auto"
              style={{
                background: 'rgba(0,0,0,0.88)',
                borderRadius: '12px',
                zIndex: 10,
                padding: '10px 12px',
              }}
            >
              <p className="text-xs text-slate-200 text-center leading-relaxed w-full">{tooltip}</p>
            </div>
          )}
        </div>
        {caption && (
          <p className="text-xs text-slate-500 mt-1.5 italic">{caption}</p>
        )}
      </div>
    </div>
  )
}
