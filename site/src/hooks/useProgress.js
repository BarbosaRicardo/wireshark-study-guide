import { useState, useEffect } from 'react'

const STORAGE_KEY = 'wireshark_progress_v1'
const PROGRESS_EVENT = 'wireshark_progress_update'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function useProgress() {
  const [progress, setProgress] = useState(load)

  useEffect(() => {
    const handler = () => setProgress(load())
    window.addEventListener(PROGRESS_EVENT, handler)
    return () => window.removeEventListener(PROGRESS_EVENT, handler)
  }, [])

  const save = (next) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setProgress(next)
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT))
  }

  const markChapterVisited = (chapterId) => {
    const next = { ...load() }
    if (!next[chapterId]) next[chapterId] = {}
    next[chapterId].visited = true
    next[chapterId].visitedAt = Date.now()
    save(next)
  }

  const markLevelComplete = (chapterId, level) => {
    const next = { ...load() }
    if (!next[chapterId]) next[chapterId] = {}
    const key = `level${level}Passed`
    next[chapterId][key] = true
    next[chapterId][`${key}At`] = Date.now()
    if (level === 1) next[chapterId].quizPassed = true
    save(next)
  }

  const markQuizComplete = (chapterId) => markLevelComplete(chapterId, 1)

  const getChapterStatus = (chapterId) => {
    const p = progress[chapterId] || {}
    return {
      visited:      !!p.visited,
      completed:    !!p.completed,
      quizPassed:   !!p.quizPassed,
      level1Passed: !!p.level1Passed || !!p.quizPassed,
      level2Passed: !!p.level2Passed,
      level3Passed: !!p.level3Passed,
      level4Passed: !!p.level4Passed,
    }
  }

  const overallProgress = () => {
    const chapters = ['intro', 'capture', 'filters', 'dissectors', 'modbus', 'dnp3', 'opcua', 'security', 'advanced', 'lab']
    const visited = chapters.filter((c) => progress[c]?.visited).length
    const l1 = chapters.filter((c) => progress[c]?.level1Passed || progress[c]?.quizPassed).length
    const l2 = chapters.filter((c) => progress[c]?.level2Passed).length
    const l3 = chapters.filter((c) => progress[c]?.level3Passed).length
    const total = chapters.length
    return {
      visited, quizzes: l1, l1, l2, l3, total,
      pct: Math.round(((visited + l1 + l2 + l3) / (total * 4)) * 100),
    }
  }

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setProgress({})
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT))
  }

  return { progress, markChapterVisited, markQuizComplete, markLevelComplete, getChapterStatus, overallProgress, reset }
}
