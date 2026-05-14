import { Pause, Play, RotateCcw, TimerReset } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import { timerOptions, timerSounds, useTimer } from '../timer/TimerContext'
import { formatDate } from '../utils/formatDate'

const initialForm = { course_id: '', duration_minutes: '', session_date: '', notes: '' }

export default function StudySessions() {
  const [sessions, setSessions] = useState([])
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState(initialForm)
  const [customMinutes, setCustomMinutes] = useState('')
  const [timerCourseId, setTimerCourseId] = useState('')
  const [timerNotes, setTimerNotes] = useState('Focused timer session')
  const {
    formattedTime,
    isRunning,
    progress,
    showGlobalTimer,
    soundId,
    timerComplete,
    timerMinutes,
    clearComplete,
    pauseTimer,
    previewSound,
    resetTimer,
    selectTimer,
    setShowGlobalTimer,
    setSoundId,
    startTimer,
  } = useTimer()

  async function loadSessions() {
    const response = await api.get('/study-sessions')
    setSessions(response.data)
  }

  useEffect(() => {
    api.get('/courses').then((response) => setCourses(response.data))
    api.get('/study-sessions').then((response) => setSessions(response.data))
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    await api.post('/study-sessions', { ...form, course_id: form.course_id || null })
    setForm(initialForm)
    loadSessions()
  }

  function applyCustomTimer() {
    const minutes = Number(customMinutes)
    if (!minutes || minutes < 1) return
    selectTimer(minutes)
  }

  async function logCompletedTimer() {
    await api.post('/study-sessions', {
      course_id: timerCourseId || null,
      duration_minutes: timerMinutes,
      notes: timerNotes || 'Focused timer session',
    })
    clearComplete()
    resetTimer()
    loadSessions()
  }

  async function deleteSession(id) {
    await api.delete(`/study-sessions/${id}`)
    loadSessions()
  }

  async function editSession(session) {
    const duration = window.prompt('Duration in minutes', session.duration_minutes)
    if (!duration) return
    const notes = window.prompt('Notes', session.notes || '') || ''
    await api.patch(`/study-sessions/${session.id}`, {
      duration_minutes: Number(duration),
      notes,
    })
    loadSessions()
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300/75">Time tempered</p>
        <h2 className="forge-page-title mt-1">Study Sessions</h2>
        <p className="mt-1 text-sm text-slate-400">Set a timer, focus fully, and log the session when the forge cools.</p>
      </div>

      <section className="forge-card-hot rounded-lg p-5">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1fr]">
          <div className="flex flex-col items-center justify-center rounded-lg border border-orange-200/10 bg-black/18 p-6 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-md bg-orange-500/15 text-amber-300">
              <TimerReset size={30} />
            </div>
            <p className="mt-5 text-5xl font-black tabular-nums text-orange-50">{formattedTime}</p>
            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-black/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            {timerComplete && (
              <p className="mt-4 rounded-md border border-amber-300/30 bg-orange-500/10 px-3 py-2 text-sm font-semibold text-amber-200">
                Time is up. Nice work.
              </p>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-black text-orange-50">Focus timer</h3>
              <p className="text-sm text-slate-400">Choose a preset or set a custom duration for longer sessions.</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {timerOptions.map((option) => (
                <button
                  key={option.minutes}
                  type="button"
                  onClick={() => selectTimer(option.minutes)}
                  className={`rounded-md border px-3 py-2 text-sm font-bold transition ${
                    timerMinutes === option.minutes
                      ? 'border-amber-300/70 bg-orange-500/15 text-orange-50'
                      : 'border-orange-200/10 bg-black/15 text-slate-300 hover:border-orange-200/30'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                className="forge-input px-3 py-2"
                type="number"
                min="1"
                placeholder="Custom minutes for 2+ hours"
                value={customMinutes}
                onChange={(event) => setCustomMinutes(event.target.value)}
              />
              <button type="button" onClick={applyCustomTimer} className="forge-button-subtle px-4 py-2 font-bold">
                Set custom
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <select className="forge-input px-3 py-2" value={timerCourseId} onChange={(event) => setTimerCourseId(event.target.value)}>
                <option value="">No course</option>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
              </select>
              <input className="forge-input px-3 py-2" value={timerNotes} onChange={(event) => setTimerNotes(event.target.value)} placeholder="Session note" />
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <select className="forge-input px-3 py-2" value={soundId} onChange={(event) => setSoundId(event.target.value)}>
                {timerSounds.map((sound) => (
                  <option key={sound.id} value={sound.id}>{sound.label}</option>
                ))}
              </select>
              <button type="button" onClick={previewSound} className="forge-button-subtle px-4 py-2 font-bold">
                Preview sound
              </button>
            </div>

            <label className="flex items-center justify-between gap-4 rounded-md border border-orange-200/10 bg-black/15 px-3 py-2 text-sm font-semibold text-slate-300">
              <span>Show timer on every screen</span>
              <input
                type="checkbox"
                className="h-5 w-5 accent-orange-500"
                checked={showGlobalTimer}
                onChange={(event) => setShowGlobalTimer(event.target.checked)}
              />
            </label>

            <div className="flex flex-wrap gap-3">
              {!isRunning ? (
                <button type="button" onClick={startTimer} className="forge-button inline-flex items-center gap-2 px-4 py-2">
                  <Play size={18} />
                  Start
                </button>
              ) : (
                <button type="button" onClick={pauseTimer} className="forge-button-subtle inline-flex items-center gap-2 px-4 py-2 font-bold">
                  <Pause size={18} />
                  Pause
                </button>
              )}
              <button type="button" onClick={resetTimer} className="forge-button-subtle inline-flex items-center gap-2 px-4 py-2 font-bold">
                <RotateCcw size={18} />
                Reset
              </button>
              <button type="button" disabled={!timerComplete} onClick={logCompletedTimer} className="forge-button px-4 py-2 disabled:opacity-40">
                Log completed session
              </button>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="forge-card grid gap-3 rounded-lg p-5 lg:grid-cols-5">
        <select className="forge-input px-3 py-2" value={form.course_id} onChange={(event) => setForm({ ...form, course_id: event.target.value })}>
          <option value="">No course</option>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
        </select>
        <input className="forge-input px-3 py-2" type="number" min="1" placeholder="Minutes" value={form.duration_minutes} onChange={(event) => setForm({ ...form, duration_minutes: event.target.value })} required />
        <input className="forge-input px-3 py-2" type="date" value={form.session_date} onChange={(event) => setForm({ ...form, session_date: event.target.value })} />
        <input className="forge-input px-3 py-2" placeholder="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        <button className="forge-button px-4 py-2">Log study</button>
      </form>
      <div className="space-y-3">
        {sessions.map((session) => (
          <article key={session.id} className="forge-card flex items-center justify-between gap-4 rounded-lg p-4">
            <div>
              <p className="font-bold text-orange-50">{session.duration_minutes} minutes</p>
              <p className="text-sm text-slate-400">{formatDate(session.session_date)} · {session.notes || 'Focused study session'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => editSession(session)} className="forge-button-subtle px-3 py-1 text-sm">Edit</button>
              <button onClick={() => deleteSession(session.id)} className="forge-button-danger px-3 py-1 text-sm">Delete</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
