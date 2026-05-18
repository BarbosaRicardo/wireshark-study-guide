import React, { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Play, RotateCcw, ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertCircle, Copy, Loader2, Lightbulb } from 'lucide-react'

// ─── JavaScript sandbox ──────────────────────────────────────────────────────
function runSandbox(userCode, testRunner) {
  const logs = []
  const fakeConsole = {
    log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
    error: (...args) => logs.push('ERROR: ' + args.join(' ')),
    warn: (...args) => logs.push('WARN: ' + args.join(' ')),
  }
  try {
    // eslint-disable-next-line no-new-func
    const wrapped = new Function('console', `
      "use strict";
      ${userCode}
      return (${testRunner.toString()})(typeof solution !== "undefined" ? solution : undefined);
    `)
    return { success: true, logs, result: wrapped(fakeConsole) }
  } catch (e) {
    return { success: false, logs, error: e.message, result: null }
  }
}

// ─── Pyodide singleton ───────────────────────────────────────────────────────
let pyodidePromise = null
function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      if (!window.loadPyodide) {
        await new Promise((res, rej) => {
          const s = document.createElement('script')
          s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js'
          s.onload = res
          s.onerror = () => rej(new Error('Failed to load Pyodide'))
          document.head.appendChild(s)
        })
      }
      return await window.loadPyodide()
    })()
  }
  return pyodidePromise
}

function pyToJs(val) {
  if (val == null) return null
  if (typeof val?.toJs === 'function') return val.toJs({ dict_converter: Object.fromEntries, depth: 10 })
  return val
}

async function runPyodideSandbox(userCode, testRunner) {
  const logs = []
  try {
    const py = await getPyodide()
    py.setStdout({ batched: (s) => { if (s.trim()) logs.push(s.trimEnd()) } })
    py.setStderr({ batched: (s) => { if (s.trim()) logs.push('ERR: ' + s.trimEnd()) } })
    await py.runPythonAsync(userCode)
    const pySolution = py.globals.get('solution')
    if (!pySolution) throw new Error("No 'solution' variable found. Add: solution = your_function_name")
    const jsSolution = (...args) => {
      const pyArgs = args.map(a => {
        if (a instanceof Uint8Array) return py.toPy(Array.from(a))
        if (Array.isArray(a)) return py.toPy(a)
        return a
      })
      return pyToJs(pySolution(...pyArgs))
    }
    const results = testRunner(jsSolution)
    return { success: true, logs, result: results }
  } catch (e) {
    return { success: false, logs, error: e.message, result: null }
  }
}

// ─── Jython orientation header ────────────────────────────────────────────────
const JYTHON_HEADER = `# ─── Jython 2.7 — Python 2 on the JVM ───────────────────────────────────────
# You know Python 3. Here is what changes in Jython 2.7:
#
#   Syntax differences:
#   • No f-strings          → use "Hello {}".format(name)
#   • Integer division      → 5 / 2 == 2  (not 2.5) — use float(5) / 2
#   • No walrus :=          → use a regular assignment on the line before
#   • No type hints         → def fn(x):  not  def fn(x: int) -> str:
#   • No match/case         → use if/elif chains
#
#   In Ignition specifically:
#   • system.tag.readBlocking(["[default]path"])  → returns list of QualifiedValues
#   • system.db.runNamedQuery("Name", {"param": val})  → returns dataset
#   • system.util.getLogger("MyScript").info("msg")  → Gateway/Designer logs
#   • Java types available: from java.util import ArrayList, HashMap
#
# ─────────────────────────────────────────────────────────────────────────────

`

const LANG_TABS = [
  { key: 'js',     label: 'JS',     monacoLang: 'javascript' },
  { key: 'python', label: 'Python', monacoLang: 'python' },
  { key: 'jython', label: 'Jython', monacoLang: 'python' },
]

// ─── TestResult ──────────────────────────────────────────────────────────────
function TestResult({ test, result }) {
  const passed = result?.passed
  return (
    <div className="flex items-start gap-2 py-1.5 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <span className="flex-shrink-0 mt-0.5">
        {passed
          ? <CheckCircle2 size={14} style={{ color: '#34d399' }} />
          : <XCircle size={14} style={{ color: '#f87171' }} />}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-mono text-slate-300">{test.description}</div>
        {!passed && result?.expected !== undefined && (
          <div className="text-xs font-mono mt-0.5" style={{ color: '#f87171' }}>
            Expected: {JSON.stringify(result.expected)} · Got: {JSON.stringify(result.actual)}
          </div>
        )}
        {!passed && result?.error && (
          <div className="text-xs font-mono mt-0.5" style={{ color: '#f87171' }}>{result.error}</div>
        )}
      </div>
    </div>
  )
}

// ─── ChapterExercise ──────────────────────────────────────────────────────────
export default function ChapterExercise({ exercise: ex }) {
  const [open, setOpen]             = useState(false)
  const [prediction, setPrediction] = useState('')
  const [predicted, setPredicted]   = useState(false)
  const [lang, setLang]             = useState('js')
  const [codeByLang, setCode]       = useState({
    js:     ex.starter   || '// TODO: implement solution',
    python: ex.starterPy || '# TODO: implement solution\n\nsolution = None',
    jython: JYTHON_HEADER + (ex.starterJython || ex.starterPy || '# TODO: implement solution\n\nsolution = None'),
  })
  const [output,  setOutput]  = useState(null)
  const [running, setRunning] = useState(false)
  const [copied,  setCopied]  = useState(false)

  const currentCode    = codeByLang[lang]
  const setCurrentCode = (v) => setCode(prev => ({ ...prev, [lang]: v || '' }))

  const run = async () => {
    setRunning(true)
    setOutput(null)
    const res = lang === 'python'
      ? await runPyodideSandbox(currentCode, ex.testRunner)
      : runSandbox(currentCode, ex.testRunner)
    setRunning(false)
    if (!res.success) { setOutput({ type: 'error', error: res.error, logs: res.logs }); return }
    const passed = res.result?.every(r => r.passed)
    setOutput({ type: 'result', results: res.result, logs: res.logs, passed })
  }

  const reset = () => {
    setCode({
      js:     ex.starter   || '',
      python: ex.starterPy || '',
      jython: JYTHON_HEADER + (ex.starterJython || ex.starterPy || ''),
    })
    setOutput(null)
  }

  const copy = () => {
    navigator.clipboard.writeText(currentCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const allPassed = output?.passed

  return (
    <div className="my-8 rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${open ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.15)'}`, background: 'rgba(139,92,246,0.03)' }}>

      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-5 py-4 flex items-center gap-3 transition-all hover:bg-purple-900/10"
      >
        <span className="text-xl flex-shrink-0">{allPassed ? '✅' : '💡'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
              Chapter Exercise
            </span>
            {allPassed && <span className="text-xs font-semibold" style={{ color: '#34d399' }}>✓ Complete</span>}
          </div>
          <div className="font-bold text-white text-sm">{ex.title}</div>
          <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{ex.scenario?.split('\n')[0]}</div>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />}
      </button>

      {/* Body */}
      {open && (
        <div style={{ borderTop: '1px solid rgba(139,92,246,0.2)' }}>

          {/* Scenario + hint */}
          <div className="px-5 pt-4 pb-2">
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{ex.scenario}</div>
            {ex.hint && (
              <div className="mt-3 px-3 py-2 rounded-lg text-xs text-slate-400 leading-relaxed"
                style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                💡 {ex.hint}
              </div>
            )}
          </div>

          {/* Generation Effect — prediction step before editor */}
          {!predicted && (
            <div className="mx-5 mb-4 rounded-xl p-4" style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#a78bfa' }}>
                Before you code — what's your approach?
              </p>
              <p className="text-xs text-slate-500 mb-3">
                Write one sentence: what's the key piece of logic you'll implement? (This improves retention by ~40% — it's not busywork.)
              </p>
              <textarea
                value={prediction}
                onChange={e => setPrediction(e.target.value)}
                placeholder="e.g. I'll parse the frame bytes, compute CRC over all but the last 2 bytes, then compare..."
                rows={2}
                className="w-full rounded-lg px-3 py-2 text-sm resize-none outline-none font-mono"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139,92,246,0.25)', color: '#c4b5fd' }}
              />
              <div className="flex gap-3 mt-3 items-center">
                <button
                  onClick={() => setPredicted(true)}
                  disabled={!prediction.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(139,92,246,0.6)' }}
                >
                  Lock it in — show me the editor
                </button>
                <button
                  onClick={() => { setPrediction(''); setPredicted(true) }}
                  className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Prediction reminder — shown after submitting */}
          {predicted && prediction.trim() && !allPassed && (
            <div className="mx-5 mb-3 px-3 py-2 rounded-lg flex gap-2 items-start"
              style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: '#7c3aed' }}>Your prediction:</span>
              <span className="text-xs italic" style={{ color: '#a78bfa' }}>"{prediction}"</span>
            </div>
          )}
          {predicted && prediction.trim() && allPassed && (
            <div className="mx-5 mb-3 px-3 py-2 rounded-lg flex gap-2 items-start"
              style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" style={{ color: '#34d399' }} />
              <div>
                <span className="text-xs" style={{ color: '#34d399' }}>You predicted: </span>
                <span className="text-xs italic" style={{ color: '#6ee7b7' }}>"{prediction}"</span>
                <span className="text-xs ml-1" style={{ color: '#34d399' }}>— compare to what you built.</span>
              </div>
            </div>
          )}

          {/* Editor */}
          <div className="mx-5 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between px-3 py-1.5 gap-2"
              style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-1">
                {LANG_TABS.map(tab => (
                  <button key={tab.key} onClick={() => { setLang(tab.key); setOutput(null) }}
                    className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all"
                    style={lang === tab.key
                      ? { background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.4)' }
                      : { background: 'transparent', color: '#475569', border: '1px solid transparent' }}>
                    {tab.label}
                  </button>
                ))}
              </div>
              <button onClick={reset} className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 transition-colors">
                <RotateCcw size={11} /> Reset
              </button>
            </div>
            <Editor
              height="240px"
              language={LANG_TABS.find(t => t.key === lang)?.monacoLang || 'javascript'}
              theme="vs-dark"
              value={currentCode}
              onChange={v => { setCurrentCode(v); setOutput(null) }}
              options={{
                fontSize: 13,
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                wordWrap: 'on',
                tabSize: lang === 'js' ? 2 : 4,
                automaticLayout: true,
                padding: { top: 10, bottom: 10 },
              }}
            />
          </div>

          {/* Actions */}
          <div className="px-5 py-3 flex items-center gap-3 flex-wrap">
            {lang === 'jython' ? (
              <>
                <button onClick={copy}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.8), #7c3aed)' }}>
                  <Copy size={14} /> {copied ? 'Copied!' : 'Copy Code'}
                </button>
                <span className="text-xs text-slate-500">Paste into Ignition Script Console or a Jython 2.7 REPL</span>
              </>
            ) : (
              <>
                <button onClick={run} disabled={running}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                  style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.8), #7c3aed)' }}>
                  {running
                    ? <><Loader2 size={14} className="animate-spin" />{lang === 'python' ? 'Loading Python…' : 'Running…'}</>
                    : <><Play size={14} />Run Code</>}
                </button>
                {lang === 'python' && !running && !output && (
                  <span className="text-xs text-slate-600">First run loads Python runtime (~10s)</span>
                )}
                {allPassed && <span className="text-sm font-semibold" style={{ color: '#34d399' }}>✓ All tests passing</span>}
                <button onClick={copy} className="ml-auto flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 transition-colors">
                  <Copy size={11} /> {copied ? 'Copied' : 'Copy'}
                </button>
              </>
            )}
          </div>

          {/* Output */}
          {output && (
            <div className="mx-5 mb-5 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              {output.logs?.length > 0 && (
                <div className="px-3 py-2 font-mono text-xs text-slate-400 leading-relaxed"
                  style={{ background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {output.logs.map((l, i) => <div key={i}><span style={{ color: '#475569' }}>&gt; </span>{l}</div>)}
                </div>
              )}
              {output.type === 'error' && (
                <div className="px-3 py-2 flex items-start gap-2" style={{ background: 'rgba(239,68,68,0.08)' }}>
                  <AlertCircle size={14} style={{ color: '#f87171', marginTop: 2 }} className="flex-shrink-0" />
                  <span className="text-xs font-mono" style={{ color: '#f87171' }}>{output.error}</span>
                </div>
              )}
              {output.type === 'result' && output.results && (
                <div className="px-3 py-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Test Results</div>
                  {output.results.map((r, i) => (
                    <TestResult key={i} test={ex.tests[i]} result={r} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
