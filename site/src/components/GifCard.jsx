import React, { useState, useEffect } from 'react'
import { GIFS } from '../data/gifs'

const TENOR_KEY = 'LIVDSRZULELA'

function buildGiphyUrl(id) {
  if (id.startsWith('http')) return id
  return `https://media1.giphy.com/media/${id}/giphy.gif`
}

export default function GifCard({ gifKey, caption, side = 'right', className = '', tooltip = null }) {
  const [url, setUrl] = useState(null)
  const [hidden, setHidden] = useState(false)
  const id = GIFS[gifKey]

  useEffect(() => {
    if (!id) { setHidden(true); return }
    if (id.startsWith('tenor:')) {
      const tenorId = id.slice(6)
      fetch(`https://tenor.googleapis.com/v2/posts?ids=${tenorId}&key=${TENOR_KEY}&media_filter=gif`)
        .then(r => r.json())
        .then(data => {
          const gifUrl = data.results?.[0]?.media_formats?.gif?.url
          if (gifUrl) setUrl(gifUrl)
          else setHidden(true)
        })
        .catch(() => setHidden(true))
    } else {
      setUrl(buildGiphyUrl(id))
    }
  }, [id])

  if (!id || hidden || !url) return null

  return (
    <div className={`flex ${side === 'left' ? 'justify-start' : 'justify-end'} my-4 ${className}`}>
      <div className="max-w-xs text-center">
        <div
          className="group"
          style={{
            width: 200,
            height: 150,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '12px',
            border: '1px solid rgba(14,165,233,0.2)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(14,165,233,0.1)',
          }}
        >
          <img
            src={url}
            alt={caption || gifKey}
            width="200"
            height="150"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            onError={() => setHidden(true)}
          />
          {tooltip && (
            <div
              className="absolute inset-0 flex items-center justify-center p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'rgba(0,0,0,0.85)', borderRadius: '12px' }}
            >
              <p className="text-xs text-slate-200 text-center leading-relaxed">{tooltip}</p>
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
