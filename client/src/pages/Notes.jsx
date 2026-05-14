import { useEffect, useState } from 'react'
import api from '../api/axios'
import Modal from '../components/Modal'
import { useToast } from '../toast/ToastContext'

const initialForm = { title: '', content: '', course_id: '' }

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingNote, setEditingNote] = useState(null)
  const [editForm, setEditForm] = useState(initialForm)
  const [deletingNote, setDeletingNote] = useState(null)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const toast = useToast()

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
    try {
      await api.post('/notes', { ...form, course_id: form.course_id || null })
      setForm(initialForm)
      loadNotes(1)
      toast.success('Note added.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to add note.')
    }
  }

  function openEditModal(note) {
    setEditingNote(note)
    setEditForm({
      title: note.title,
      content: note.content || '',
      course_id: note.course_id || '',
    })
  }

  async function handleEditSubmit(event) {
    event.preventDefault()
    if (!editingNote) return
    setSaving(true)
    try {
      await api.patch(`/notes/${editingNote.id}`, { ...editForm, course_id: editForm.course_id || null })
      setEditingNote(null)
      loadNotes()
      toast.success('Note updated.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to update note.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deletingNote) return
    setSaving(true)
    try {
      await api.delete(`/notes/${deletingNote.id}`)
      setDeletingNote(null)
      loadNotes()
      toast.success('Note deleted.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to delete note.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300/75">Knowledge anvil</p>
        <h2 className="forge-page-title mt-1">Notes</h2>
      </div>
      <form onSubmit={handleSubmit} className="forge-card forge-hover-lift space-y-3 rounded-lg p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="forge-input px-3 py-2" placeholder="Note title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <select className="forge-input px-3 py-2" value={form.course_id} onChange={(event) => setForm({ ...form, course_id: event.target.value })}>
            <option value="">No course</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
          </select>
        </div>
        <textarea className="forge-input min-h-32 px-3 py-2" placeholder="Write your note..." value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} required />
        <button className="forge-button px-4 py-2">Add note</button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {notes.map((note) => (
          <article key={note.id} className="forge-card forge-hover-lift rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-bold text-orange-50">{note.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => openEditModal(note)} className="forge-button-subtle px-3 py-1 text-sm">Edit</button>
                <button onClick={() => setDeletingNote(note)} className="forge-button-danger px-3 py-1 text-sm">Delete</button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-400">{note.content}</p>
          </article>
        ))}
      </div>
      <div className="flex items-center justify-end gap-3">
        <button disabled={page <= 1} onClick={() => loadNotes(page - 1)} className="forge-button-subtle px-3 py-2 text-sm disabled:opacity-40">Previous</button>
        <span className="text-sm text-slate-400">Page {page} of {pages}</span>
        <button disabled={page >= pages} onClick={() => loadNotes(page + 1)} className="forge-button-subtle px-3 py-2 text-sm disabled:opacity-40">Next</button>
      </div>

      <Modal
        isOpen={Boolean(editingNote)}
        title="Edit note"
        onClose={() => setEditingNote(null)}
        onSubmit={handleEditSubmit}
        submitLabel="Save note"
        submitting={saving}
      >
        <label className="block text-sm font-semibold text-orange-100/90">
          Title
          <input className="forge-input mt-2 px-3 py-2" value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} required />
        </label>
        <label className="block text-sm font-semibold text-orange-100/90">
          Course
          <select className="forge-input mt-2 px-3 py-2" value={editForm.course_id} onChange={(event) => setEditForm({ ...editForm, course_id: event.target.value })}>
            <option value="">No course</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold text-orange-100/90">
          Content
          <textarea className="forge-input mt-2 min-h-48 px-3 py-2" value={editForm.content} onChange={(event) => setEditForm({ ...editForm, content: event.target.value })} required />
        </label>
      </Modal>

      <Modal
        isOpen={Boolean(deletingNote)}
        title="Delete note?"
        onClose={() => setDeletingNote(null)}
        onSubmit={(event) => {
          event.preventDefault()
          confirmDelete()
        }}
        submitLabel="Delete note"
        submitting={saving}
        danger
      >
        <p className="text-sm leading-6 text-slate-300">
          This will permanently delete {deletingNote?.title}.
        </p>
      </Modal>
    </div>
  )
}
