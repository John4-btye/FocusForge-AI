import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import EmptyState from '../components/EmptyState'

export default function CourseDetails() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)

  useEffect(() => {
    api.get(`/courses/${id}`).then((response) => setCourse(response.data))
  }, [id])

  if (!course) return <div className="text-slate-600">Loading course...</div>

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <div className="h-2 w-20 rounded-full" style={{ background: course.color }} />
        <h2 className="mt-4 text-2xl font-semibold text-slate-950">{course.name}</h2>
        <p className="text-slate-600">{course.instructor || 'No instructor listed'}</p>
      </div>
      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Course tasks">
          {course.tasks.length ? course.tasks.map((task) => <Item key={task.id} title={task.title} text={task.priority} />) : <EmptyState title="No tasks" message="Tasks for this course will appear here." />}
        </Panel>
        <Panel title="Course notes">
          {course.notes.length ? course.notes.map((note) => <Item key={note.id} title={note.title} text={note.content} />) : <EmptyState title="No notes" message="Notes for this course will appear here." />}
        </Panel>
      </section>
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-950">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Item({ title, text }) {
  return (
    <div className="rounded-md border border-slate-200 p-3">
      <p className="font-medium text-slate-900">{title}</p>
      <p className="line-clamp-2 text-sm text-slate-500">{text}</p>
    </div>
  )
}
