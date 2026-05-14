import { useEffect, useState } from 'react'
import api from '../api/axios'
import { formatDate } from '../utils/formatDate'

const initialForm = { title: '', description: '', due_date: '', priority: 'medium', course_id: '' }

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState(initialForm)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

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
    await api.post('/tasks', { ...form, course_id: form.course_id || null })
    setForm(initialForm)
    loadTasks(1)
  }

  async function toggleTask(task) {
    await api.patch(`/tasks/${task.id}`, { completed: !task.completed })
    loadTasks()
  }

  async function deleteTask(id) {
    await api.delete(`/tasks/${id}`)
    loadTasks()
  }

  async function editTask(task) {
    const title = window.prompt('Task title', task.title)
    if (!title) return
    const due_date = window.prompt('Due date (YYYY-MM-DD)', task.due_date || '') || null
    await api.patch(`/tasks/${task.id}`, { title, due_date })
    loadTasks()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-950">Tasks</h2>
      <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg bg-white p-5 shadow-sm lg:grid-cols-5">
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Task title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="date" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} />
        <select className="rounded-md border border-slate-300 px-3 py-2" value={form.course_id} onChange={(event) => setForm({ ...form, course_id: event.target.value })}>
          <option value="">No course</option>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
        </select>
        <button className="rounded-md bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800">Add task</button>
      </form>
      <div className="space-y-3">
        {tasks.map((task) => (
          <article key={task.id} className="flex items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-sm">
            <label className="flex min-w-0 items-start gap-3">
              <input className="mt-1" type="checkbox" checked={task.completed} onChange={() => toggleTask(task)} />
              <span>
                <span className={`block font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-950'}`}>{task.title}</span>
                <span className="block text-sm text-slate-500">{formatDate(task.due_date)} · {task.priority}</span>
              </span>
            </label>
            <div className="flex gap-2">
              <button onClick={() => editTask(task)} className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">Edit</button>
              <button onClick={() => deleteTask(task.id)} className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50">Delete</button>
            </div>
          </article>
        ))}
      </div>
      <div className="flex items-center justify-end gap-3">
        <button disabled={page <= 1} onClick={() => loadTasks(page - 1)} className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-40">Previous</button>
        <span className="text-sm text-slate-600">Page {page} of {pages}</span>
        <button disabled={page >= pages} onClick={() => loadTasks(page + 1)} className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-40">Next</button>
      </div>
    </div>
  )
}
