import { useState, useEffect } from 'react'

const SUPABASE_URL = 'https://qacvqifwvqjmyzvryxkw.supabase.co'
const SUPABASE_KEY = 'sb_publishable_vRSczSzVTBwJ3CteyGUdeA_XD13TiWc'
export const APP_NAME = 'wireshark'

const LOCAL_KEY = 'quiz_submissions_v1'

const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
}

// ─── Write ────────────────────────────────────────────────────────────────────
export async function recordQuizSubmission({ chapter, level, score, total, attempt }) {
  const record = {
    app: APP_NAME,
    chapter,
    level,
    score,
    total,
    pct: Math.round((score / total) * 100),
    passed: score / total >= 0.7,
    attempt,
  }

  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
    existing.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ts: Date.now(), ...record })
    localStorage.setItem(LOCAL_KEY, JSON.stringify(existing))
  } catch {}

  fetch(`${SUPABASE_URL}/rest/v1/quiz_submissions`, {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'return=minimal' },
    body: JSON.stringify(record),
  }).catch(() => {})
}

// ─── Read (this app only) ─────────────────────────────────────────────────────
async function fetchFromSupabase(appFilter) {
  const filter = appFilter ? `&app=eq.${appFilter}` : ''
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/quiz_submissions?order=created_at.desc&limit=1000${filter}`,
    { headers: HEADERS }
  )
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

export function useQuizReport() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchFromSupabase(APP_NAME)
      setSubmissions(data)
    } catch (e) {
      setError(e.message)
      try { setSubmissions([...JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')].reverse()) } catch {}
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const clearLocal = () => {
    localStorage.removeItem(LOCAL_KEY)
  }

  return { submissions, loading, error, refresh, clearLocal }
}

// ─── Read (all apps) — for manager report ────────────────────────────────────
export function useAllSubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchFromSupabase(null)
      setSubmissions(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  return { submissions, loading, error, refresh }
}
