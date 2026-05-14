import { useEffect, useState } from 'react'
import api from '../api/axios'
import { formatDate } from '../utils/formatDate'

const initialForm = { course_id: '', duration_minutes: '', session_date: '', notes: '' }

export default function StudySessions() {
  const [sessions, setSessions] = useState([])
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState(initialForm)

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
      </div>
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
