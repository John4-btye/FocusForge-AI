import { Pause, Play, RotateCcw, TimerReset } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import Modal from '../components/Modal'
import { breakOptions, timerOptions, timerSounds, useTimer } from '../timer/TimerContext'
import { useToast } from '../toast/ToastContext'
import { formatDate } from '../utils/formatDate'

const initialForm = { course_id: '', duration_minutes: '', session_date: '', notes: '' }

export default function StudySessions() {
  // Study page combines timer controls, manual session logging, and session history.
  const [sessions, setSessions] = useState([])
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingSession, setEditingSession] = useState(null)
  const [editForm, setEditForm] = useState(initialForm)
  const [deletingSession, setDeletingSession] = useState(null)
  const [saving, setSaving] = useState(false)
  const [customMinutes, setCustomMinutes] = useState('')
  const [timerCourseId, setTimerCourseId] = useState('')
  const [timerNotes, setTimerNotes] = useState('Focused timer session')
  const toast = useToast()
  const {
    formattedTime,
    isRunning,
    progress,
    showGlobalTimer,
    soundId,
    completedFocusMinutes,
    completedMode,
    timerComplete,
    timerMinutes,
    timerMode,
    clearComplete,
    pauseTimer,
    previewSound,
    resetTimer,
    selectBreak,
    selectTimer,
    setShowGlobalTimer,
    setSoundId,
    startTimer,
  } = useTimer()

  async function loadSessions() {
    // Refresh the session history after manual logs, timer logs, edits, or deletes.
    const response = await api.get('/study-sessions')
    setSessions(response.data)
  }

  useEffect(() => {
    api.get('/courses').then((response) => setCourses(response.data))
    api.get('/study-sessions').then((response) => setSessions(response.data))
  }, [])

  async function handleSubmit(event) {
    // Manual study session form creates a session without using the countdown timer.
    event.preventDefault()
    try {
      await api.post('/study-sessions', { ...form, course_id: form.course_id || null })
      setForm(initialForm)
      loadSessions()
      toast.success('Study session logged.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to log study session.')
    }
  }

  function applyCustomTimer() {
    // Custom timers allow durations beyond the preset study options.
    const minutes = Number(customMinutes)
    if (!minutes || minutes < 1) {
      toast.error('Enter a custom timer length greater than 0 minutes.')
      return
    }
    selectTimer(minutes)
    toast.info(`Timer set for ${minutes} minutes.`)
  }

  async function logCompletedTimer() {
    // Completed timer logs reuse the study-session API so dashboard stats update.
    if (completedMode !== 'focus') {
      toast.info('Break timers are not logged as study sessions.')
      return
    }

    try {
      await api.post('/study-sessions', {
        course_id: timerCourseId || null,
        duration_minutes: completedFocusMinutes || timerMinutes,
        notes: timerNotes || 'Focused timer session',
      })
      clearComplete()
      resetTimer()
      loadSessions()
      toast.success('Completed timer logged as a study session.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to log completed timer.')
    }
  }

  function openEditModal(session) {
    // Session edit modal copies existing data so canceling leaves history untouched.
    setEditingSession(session)
    setEditForm({
      course_id: session.course_id || '',
      duration_minutes: session.duration_minutes || '',
      session_date: session.session_date || '',
      notes: session.notes || '',
    })
  }

  async function handleEditSubmit(event) {
    // Modal can update duration, date, notes, and optional course association.
    event.preventDefault()
    if (!editingSession) return
    setSaving(true)
    try {
      await api.patch(`/study-sessions/${editingSession.id}`, { ...editForm, course_id: editForm.course_id || null })
      setEditingSession(null)
      loadSessions()
      toast.success('Study session updated.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to update study session.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    // Destructive session removal requires the confirmation modal.
    if (!deletingSession) return
    setSaving(true)
    try {
      await api.delete(`/study-sessions/${deletingSession.id}`)
      setDeletingSession(null)
      loadSessions()
      toast.success('Study session deleted.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to delete study session.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300/75">Time tempered</p>
        <h2 className="forge-page-title mt-1">Study Sessions</h2>
        <p className="mt-1 text-sm text-slate-400">Set a timer, focus fully, and log the session when the forge cools.</p>
      </div>

      <section className="forge-card-hot forge-hover-lift rounded-lg p-5">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1fr]">
          <div className="flex flex-col items-center justify-center rounded-lg border border-orange-200/10 bg-black/18 p-6 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-md bg-orange-500/15 text-amber-300">
              <TimerReset size={30} />
            </div>
            <p className="mt-4 rounded-md border border-orange-200/10 bg-black/18 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-amber-300/75">
              {timerMode === 'break' ? 'Break timer' : 'Focus timer'}
            </p>
            <p className="mt-5 text-5xl font-black tabular-nums text-orange-50">{formattedTime}</p>
            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-black/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            {timerComplete && (
              <p className="mt-4 rounded-md border border-amber-300/30 bg-orange-500/10 px-3 py-2 text-sm font-semibold text-amber-200">
                {completedMode === 'break' ? 'Break complete. Return when you feel ready.' : 'Time is up. Nice work.'}
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
                  className={`rounded-md border px-3 py-2 text-sm font-bold transition hover:-translate-y-0.5 ${
                    timerMinutes === option.minutes
                      ? 'border-amber-300/70 bg-orange-500/15 text-orange-50'
                      : 'border-orange-200/10 bg-black/15 text-slate-300 hover:border-orange-200/30'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="rounded-lg border border-orange-200/10 bg-black/15 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-black text-orange-50">Break timer</h4>
                  <p className="text-sm text-slate-400">Use a short reset between study rounds. Breaks are not logged as study minutes.</p>
                </div>
                <span className="rounded-md border border-amber-300/20 bg-orange-500/10 px-2 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                  Retention aid
                </span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-4">
                {breakOptions.map((option) => (
                  <button
                    key={option.minutes}
                    type="button"
                    onClick={() => selectBreak(option.minutes)}
                    className={`rounded-md border px-3 py-2 text-sm font-bold transition hover:-translate-y-0.5 ${
                      timerMode === 'break' && timerMinutes === option.minutes
                        ? 'border-amber-300/70 bg-orange-500/15 text-orange-50'
                        : 'border-orange-200/10 bg-black/15 text-slate-300 hover:border-orange-200/30'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
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

            <label className="forge-row-hover flex items-center justify-between gap-4 rounded-md border border-orange-200/10 bg-black/15 px-3 py-2 text-sm font-semibold text-slate-300">
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
              <button type="button" disabled={!timerComplete || completedMode !== 'focus'} onClick={logCompletedTimer} className="forge-button px-4 py-2 disabled:opacity-40">
                Log completed session
              </button>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="forge-card forge-hover-lift grid gap-3 rounded-lg p-5 lg:grid-cols-5">
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
          <article key={session.id} className="forge-card forge-row-hover flex items-center justify-between gap-4 rounded-lg p-4">
            <div>
              <p className="font-bold text-orange-50">{session.duration_minutes} minutes</p>
              <p className="text-sm text-slate-400">{formatDate(session.session_date)} · {session.notes || 'Focused study session'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEditModal(session)} className="forge-button-subtle px-3 py-1 text-sm">Edit</button>
              <button onClick={() => setDeletingSession(session)} className="forge-button-danger px-3 py-1 text-sm">Delete</button>
            </div>
          </article>
        ))}
      </div>

      <Modal
        isOpen={Boolean(editingSession)}
        title="Edit study session"
        onClose={() => setEditingSession(null)}
        onSubmit={handleEditSubmit}
        submitLabel="Save session"
        submitting={saving}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-orange-100/90">
            Duration minutes
            <input className="forge-input mt-2 px-3 py-2" type="number" min="1" value={editForm.duration_minutes} onChange={(event) => setEditForm({ ...editForm, duration_minutes: event.target.value })} required />
          </label>
          <label className="block text-sm font-semibold text-orange-100/90">
            Date
            <input className="forge-input mt-2 px-3 py-2" type="date" value={editForm.session_date} onChange={(event) => setEditForm({ ...editForm, session_date: event.target.value })} />
          </label>
        </div>
        <label className="block text-sm font-semibold text-orange-100/90">
          Course
          <select className="forge-input mt-2 px-3 py-2" value={editForm.course_id} onChange={(event) => setEditForm({ ...editForm, course_id: event.target.value })}>
            <option value="">No course</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold text-orange-100/90">
          Notes
          <textarea className="forge-input mt-2 min-h-28 px-3 py-2" value={editForm.notes} onChange={(event) => setEditForm({ ...editForm, notes: event.target.value })} />
        </label>
      </Modal>

      <Modal
        isOpen={Boolean(deletingSession)}
        title="Delete study session?"
        onClose={() => setDeletingSession(null)}
        onSubmit={(event) => {
          event.preventDefault()
          confirmDelete()
        }}
        submitLabel="Delete session"
        submitting={saving}
        danger
      >
        <p className="text-sm leading-6 text-slate-300">
          This will permanently delete the {deletingSession?.duration_minutes}-minute study session.
        </p>
      </Modal>
    </div>
  )
}
