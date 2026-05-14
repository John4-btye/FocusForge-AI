import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import EmptyState from '../components/EmptyState'

const initialForm = { name: '', instructor: '', color: '#f97316' }

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
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300/75">Academic materials</p>
        <h2 className="forge-page-title mt-1">Courses</h2>
      </div>
      <form onSubmit={handleSubmit} className="forge-card forge-hover-lift grid gap-3 rounded-lg p-5 md:grid-cols-[1fr_1fr_auto_auto]">
        <input className="forge-input px-3 py-2" placeholder="Course name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <input className="forge-input px-3 py-2" placeholder="Instructor" value={form.instructor} onChange={(event) => setForm({ ...form, instructor: event.target.value })} />
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
                  <p className="text-sm text-slate-400">{course.instructor || 'No instructor listed'}</p>
                  <p className="mt-3 text-sm text-slate-300">{course.task_count} tasks · {course.note_count} notes</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(course)} className="forge-button-subtle px-3 py-1 text-sm">Edit</button>
                  <button onClick={() => handleDelete(course.id)} className="forge-button-danger px-3 py-1 text-sm">Delete</button>
                </div>
              </div>
              <Link className="mt-4 inline-block text-sm font-bold text-amber-300 hover:text-orange-200" to={`/courses/${course.id}`}>View details</Link>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No courses yet" message="Add your first class or subject to organize tasks and notes." />
      )}
    </div>
  )
}
