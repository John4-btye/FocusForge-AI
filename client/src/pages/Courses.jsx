import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import { useToast } from '../toast/ToastContext'

const initialForm = { name: '', instructor: '', color: '#f97316' }

export default function Courses() {
  // Courses page manages create/edit/delete state plus modal confirmation state.
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingCourse, setEditingCourse] = useState(null)
  const [editForm, setEditForm] = useState(initialForm)
  const [deletingCourse, setDeletingCourse] = useState(null)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  async function loadCourses() {
    // Refresh course cards after create, edit, or delete.
    const response = await api.get('/courses')
    setCourses(response.data)
  }

  useEffect(() => {
    api.get('/courses').then((response) => setCourses(response.data))
  }, [])

  async function handleSubmit(event) {
    // Create flow posts the form, resets it, and refreshes the list.
    event.preventDefault()
    try {
      await api.post('/courses', form)
      setForm(initialForm)
      loadCourses()
      toast.success('Course added.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to add course.')
    }
  }

  function openEditModal(course) {
    // Copy the selected course into local modal state so edits can be canceled safely.
    setEditingCourse(course)
    setEditForm({
      name: course.name,
      instructor: course.instructor || '',
      color: course.color || '#f97316',
    })
  }

  async function handleEditSubmit(event) {
    // Save only happens when the modal form is submitted.
    event.preventDefault()
    if (!editingCourse) return
    setSaving(true)
    try {
      await api.patch(`/courses/${editingCourse.id}`, editForm)
      setEditingCourse(null)
      loadCourses()
      toast.success('Course updated.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to update course.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    // Destructive action is separated from the initial Delete button click.
    if (!deletingCourse) return
    setSaving(true)
    try {
      await api.delete(`/courses/${deletingCourse.id}`)
      setDeletingCourse(null)
      loadCourses()
      toast.success('Course deleted.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to delete course.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300/75">Academic materials</p>
        <h2 className="forge-page-title mt-1">Courses</h2>
      </div>
      <form onSubmit={handleSubmit} className="forge-card forge-hover-lift grid gap-3 rounded-lg p-5 md:grid-cols-[1fr_1fr_auto_auto]">
        <input className="forge-input px-3 py-2" placeholder="Course Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <input className="forge-input px-3 py-2" placeholder="Subject" value={form.instructor} onChange={(event) => setForm({ ...form, instructor: event.target.value })} />
        <input className="h-10 rounded-md border border-orange-200/20 bg-black/30 px-2" type="color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} />
        <button className="forge-button px-4 py-2">Add</button>
      </form>
      {courses.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <article key={course.id} className="forge-card-hot forge-hover-lift rounded-lg p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 h-2 w-16 rounded-full shadow-[0_0_18px_rgba(249,115,22,0.32)]" style={{ background: course.color }} />
                  <h3 className="text-lg font-bold text-orange-50">{course.name}</h3>
                  <p className="text-sm text-slate-400">{course.instructor || 'No subject listed'}</p>
                  <p className="mt-3 text-sm text-slate-300">{course.task_count} tasks · {course.note_count} notes</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(course)} className="forge-button-subtle px-3 py-1 text-sm">Edit</button>
                  <button onClick={() => setDeletingCourse(course)} className="forge-button-danger px-3 py-1 text-sm">Delete</button>
                </div>
              </div>
              <Link className="mt-4 inline-block text-sm font-bold text-amber-300 hover:text-orange-200" to={`/courses/${course.id}`}>View details</Link>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No courses yet" message="Add your first class or subject to organize tasks and notes." />
      )}

      <Modal
        isOpen={Boolean(editingCourse)}
        title="Edit course"
        onClose={() => setEditingCourse(null)}
        onSubmit={handleEditSubmit}
        submitLabel="Save course"
        submitting={saving}
      >
        <label className="block text-sm font-semibold text-orange-100/90">
          Course Name
          <input className="forge-input mt-2 px-3 py-2" value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} required />
        </label>
        <label className="block text-sm font-semibold text-orange-100/90">
          Subject
          <input className="forge-input mt-2 px-3 py-2" value={editForm.instructor} onChange={(event) => setEditForm({ ...editForm, instructor: event.target.value })} />
        </label>
        <label className="block text-sm font-semibold text-orange-100/90">
          Accent color
          <input className="mt-2 h-10 w-full rounded-md border border-orange-200/20 bg-black/30 px-2" type="color" value={editForm.color} onChange={(event) => setEditForm({ ...editForm, color: event.target.value })} />
        </label>
      </Modal>

      <Modal
        isOpen={Boolean(deletingCourse)}
        title="Delete course?"
        onClose={() => setDeletingCourse(null)}
        onSubmit={(event) => {
          event.preventDefault()
          confirmDelete()
        }}
        submitLabel="Delete course"
        submitting={saving}
        danger
      >
        <p className="text-sm leading-6 text-slate-300">
          This will delete {deletingCourse?.name} and its related tasks, notes, and study sessions.
        </p>
      </Modal>
    </div>
  )
}
