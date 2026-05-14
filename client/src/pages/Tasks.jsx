import { useEffect, useState } from 'react'
import api from '../api/axios'
import Modal from '../components/Modal'
import { useToast } from '../toast/ToastContext'
import { formatDate } from '../utils/formatDate'

const initialForm = { title: '', description: '', due_date: '', priority: 'medium', course_id: '' }

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingTask, setEditingTask] = useState(null)
  const [editForm, setEditForm] = useState({ ...initialForm, completed: false })
  const [deletingTask, setDeletingTask] = useState(null)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const toast = useToast()

  async function loadTasks(nextPage = page) {
    const response = await api.get(`/tasks?page=${nextPage}&per_page=10`)
    setTasks(response.data.items)
    setPage(response.data.page)
    setPages(response.data.pages || 1)
  }

  useEffect(() => {
    api.get('/courses').then((response) => setCourses(response.data))
    api.get('/tasks?page=1&per_page=10').then((response) => {
      setTasks(response.data.items)
      setPage(response.data.page)
      setPages(response.data.pages || 1)
    })
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      await api.post('/tasks', { ...form, course_id: form.course_id || null })
      setForm(initialForm)
      loadTasks(1)
      toast.success('Task added.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to add task.')
    }
  }

  async function toggleTask(task) {
    try {
      await api.patch(`/tasks/${task.id}`, { completed: !task.completed })
      loadTasks()
      toast.success(!task.completed ? 'Task marked complete.' : 'Task reopened.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to update task.')
    }
  }

  function openEditModal(task) {
    setEditingTask(task)
    setEditForm({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      priority: task.priority || 'medium',
      course_id: task.course_id || '',
      completed: Boolean(task.completed),
    })
  }

  async function handleEditSubmit(event) {
    event.preventDefault()
    if (!editingTask) return
    setSaving(true)
    try {
      await api.patch(`/tasks/${editingTask.id}`, { ...editForm, course_id: editForm.course_id || null })
      setEditingTask(null)
      loadTasks()
      toast.success('Task updated.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to update task.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deletingTask) return
    setSaving(true)
    try {
      await api.delete(`/tasks/${deletingTask.id}`)
      setDeletingTask(null)
      loadTasks()
      toast.success('Task deleted.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to delete task.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300/75">Assignment forge</p>
        <h2 className="forge-page-title mt-1">Tasks</h2>
      </div>
      <form onSubmit={handleSubmit} className="forge-card forge-hover-lift grid gap-3 rounded-lg p-5 lg:grid-cols-5">
        <input className="forge-input px-3 py-2" placeholder="Task title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        <input className="forge-input px-3 py-2" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <input className="forge-input px-3 py-2" type="date" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} />
        <select className="forge-input px-3 py-2" value={form.course_id} onChange={(event) => setForm({ ...form, course_id: event.target.value })}>
          <option value="">No course</option>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
        </select>
        <button className="forge-button px-4 py-2">Add task</button>
      </form>
      <div className="space-y-3">
        {tasks.map((task) => (
          <article key={task.id} className="forge-card forge-row-hover flex items-center justify-between gap-4 rounded-lg p-4">
            <label className="flex min-w-0 items-start gap-3">
              <input className="mt-1 accent-orange-500" type="checkbox" checked={task.completed} onChange={() => toggleTask(task)} />
              <span>
                <span className={`block font-semibold ${task.completed ? 'text-slate-500 line-through' : 'text-orange-50'}`}>{task.title}</span>
                <span className="block text-sm text-slate-400">{formatDate(task.due_date)} · {task.priority}</span>
              </span>
            </label>
            <div className="flex gap-2">
              <button onClick={() => openEditModal(task)} className="forge-button-subtle px-3 py-1 text-sm">Edit</button>
              <button onClick={() => setDeletingTask(task)} className="forge-button-danger px-3 py-1 text-sm">Delete</button>
            </div>
          </article>
        ))}
      </div>
      <div className="flex items-center justify-end gap-3">
        <button disabled={page <= 1} onClick={() => loadTasks(page - 1)} className="forge-button-subtle px-3 py-2 text-sm disabled:opacity-40">Previous</button>
        <span className="text-sm text-slate-400">Page {page} of {pages}</span>
        <button disabled={page >= pages} onClick={() => loadTasks(page + 1)} className="forge-button-subtle px-3 py-2 text-sm disabled:opacity-40">Next</button>
      </div>

      <Modal
        isOpen={Boolean(editingTask)}
        title="Edit task"
        onClose={() => setEditingTask(null)}
        onSubmit={handleEditSubmit}
        submitLabel="Save task"
        submitting={saving}
      >
        <label className="block text-sm font-semibold text-orange-100/90">
          Title
          <input className="forge-input mt-2 px-3 py-2" value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} required />
        </label>
        <label className="block text-sm font-semibold text-orange-100/90">
          Description
          <textarea className="forge-input mt-2 min-h-24 px-3 py-2" value={editForm.description} onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-orange-100/90">
            Due date
            <input className="forge-input mt-2 px-3 py-2" type="date" value={editForm.due_date} onChange={(event) => setEditForm({ ...editForm, due_date: event.target.value })} />
          </label>
          <label className="block text-sm font-semibold text-orange-100/90">
            Priority
            <select className="forge-input mt-2 px-3 py-2" value={editForm.priority} onChange={(event) => setEditForm({ ...editForm, priority: event.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
        <label className="block text-sm font-semibold text-orange-100/90">
          Course
          <select className="forge-input mt-2 px-3 py-2" value={editForm.course_id} onChange={(event) => setEditForm({ ...editForm, course_id: event.target.value })}>
            <option value="">No course</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
          </select>
        </label>
        <label className="forge-row-hover flex items-center justify-between gap-4 rounded-md border border-orange-200/10 bg-black/15 px-3 py-2 text-sm font-semibold text-slate-300">
          <span>Completed</span>
          <input className="h-5 w-5 accent-orange-500" type="checkbox" checked={editForm.completed} onChange={(event) => setEditForm({ ...editForm, completed: event.target.checked })} />
        </label>
      </Modal>

      <Modal
        isOpen={Boolean(deletingTask)}
        title="Delete task?"
        onClose={() => setDeletingTask(null)}
        onSubmit={(event) => {
          event.preventDefault()
          confirmDelete()
        }}
        submitLabel="Delete task"
        submitting={saving}
        danger
      >
        <p className="text-sm leading-6 text-slate-300">
          This will permanently delete {deletingTask?.title}.
        </p>
      </Modal>
    </div>
  )
}
