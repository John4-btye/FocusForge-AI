import { useEffect, useState } from 'react'
import api from '../api/axios'

const initialForm = { title: '', content: '', course_id: '' }

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState(initialForm)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  async function loadNotes(nextPage = page) {
    const response = await api.get(`/notes?page=${nextPage}&per_page=10`)
    setNotes(response.data.items)
    setPage(response.data.page)
    setPages(response.data.pages || 1)
  }

  useEffect(() => {
    api.get('/courses').then((response) => setCourses(response.data))
    api.get('/notes?page=1&per_page=10').then((response) => {
      setNotes(response.data.items)
      setPage(response.data.page)
      setPages(response.data.pages || 1)
    })
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    await api.post('/notes', { ...form, course_id: form.course_id || null })
    setForm(initialForm)
    loadNotes(1)
  }

  async function deleteNote(id) {
    await api.delete(`/notes/${id}`)
    loadNotes()
  }

  async function editNote(note) {
    const title = window.prompt('Note title', note.title)
    if (!title) return
    const content = window.prompt('Note content', note.content)
    if (!content) return
    await api.patch(`/notes/${note.id}`, { title, content })
    loadNotes()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-950">Notes</h2>
      <form onSubmit={handleSubmit} className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Note title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <select className="rounded-md border border-slate-300 px-3 py-2" value={form.course_id} onChange={(event) => setForm({ ...form, course_id: event.target.value })}>
            <option value="">No course</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
          </select>
        </div>
        <textarea className="min-h-32 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Write your note..." value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} required />
        <button className="rounded-md bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800">Add note</button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {notes.map((note) => (
          <article key={note.id} className="rounded-lg bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-semibold text-slate-950">{note.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => editNote(note)} className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">Edit</button>
                <button onClick={() => deleteNote(note.id)} className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50">Delete</button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{note.content}</p>
          </article>
        ))}
      </div>
      <div className="flex items-center justify-end gap-3">
        <button disabled={page <= 1} onClick={() => loadNotes(page - 1)} className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-40">Previous</button>
        <span className="text-sm text-slate-600">Page {page} of {pages}</span>
        <button disabled={page >= pages} onClick={() => loadNotes(page + 1)} className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-40">Next</button>
      </div>
    </div>
  )
}
