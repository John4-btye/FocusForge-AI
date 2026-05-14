import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import EmptyState from '../components/EmptyState'

const initialForm = { name: '', instructor: '', color: '#0f766e' }

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState(initialForm)

  async function loadCourses() {
    const response = await api.get('/courses')
    setCourses(response.data)
  }

  useEffect(() => {
    api.get('/courses').then((response) => setCourses(response.data))
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    await api.post('/courses', form)
    setForm(initialForm)
    loadCourses()
  }

  async function handleDelete(id) {
    await api.delete(`/courses/${id}`)
    loadCourses()
  }

  async function handleEdit(course) {
    const name = window.prompt('Course name', course.name)
    if (!name) return
    const instructor = window.prompt('Instructor', course.instructor || '') || ''
    await api.patch(`/courses/${course.id}`, { name, instructor })
    loadCourses()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-950">Courses</h2>
      <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg bg-white p-5 shadow-sm md:grid-cols-[1fr_1fr_auto_auto]">
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Course name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Instructor" value={form.instructor} onChange={(event) => setForm({ ...form, instructor: event.target.value })} />
        <input className="h-10 rounded-md border border-slate-300 px-2" type="color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} />
        <button className="rounded-md bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800">Add</button>
      </form>
      {courses.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <article key={course.id} className="rounded-lg bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 h-2 w-16 rounded-full" style={{ background: course.color }} />
                  <h3 className="text-lg font-semibold text-slate-950">{course.name}</h3>
                  <p className="text-sm text-slate-500">{course.instructor || 'No instructor listed'}</p>
                  <p className="mt-3 text-sm text-slate-600">{course.task_count} tasks · {course.note_count} notes</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(course)} className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">Edit</button>
                  <button onClick={() => handleDelete(course.id)} className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50">Delete</button>
                </div>
              </div>
              <Link className="mt-4 inline-block text-sm font-medium text-teal-700" to={`/courses/${course.id}`}>View details</Link>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No courses yet" message="Add your first class or subject to organize tasks and notes." />
      )}
    </div>
  )
}
