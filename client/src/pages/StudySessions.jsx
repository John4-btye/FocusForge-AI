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
      <h2 className="text-2xl font-semibold text-slate-950">Study Sessions</h2>
      <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg bg-white p-5 shadow-sm lg:grid-cols-5">
        <select className="rounded-md border border-slate-300 px-3 py-2" value={form.course_id} onChange={(event) => setForm({ ...form, course_id: event.target.value })}>
          <option value="">No course</option>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
        </select>
        <input className="rounded-md border border-slate-300 px-3 py-2" type="number" min="1" placeholder="Minutes" value={form.duration_minutes} onChange={(event) => setForm({ ...form, duration_minutes: event.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="date" value={form.session_date} onChange={(event) => setForm({ ...form, session_date: event.target.value })} />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        <button className="rounded-md bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800">Log study</button>
      </form>
      <div className="space-y-3">
        {sessions.map((session) => (
          <article key={session.id} className="flex items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-sm">
            <div>
              <p className="font-medium text-slate-950">{session.duration_minutes} minutes</p>
              <p className="text-sm text-slate-500">{formatDate(session.session_date)} · {session.notes || 'Focused study session'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => editSession(session)} className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">Edit</button>
              <button onClick={() => deleteSession(session.id)} className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50">Delete</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
