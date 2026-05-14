import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import EmptyState from '../components/EmptyState'

export default function CourseDetails() {
  // Course detail fetches one course plus its related tasks and notes.
  const { id } = useParams()
  const [course, setCourse] = useState(null)

  useEffect(() => {
    api.get(`/courses/${id}`).then((response) => setCourse(response.data))
  }, [id])

  if (!course) return <div className="forge-muted">Loading course...</div>

  return (
    <div className="space-y-6">
      <div className="forge-card-hot forge-hover-lift rounded-lg p-5">
        <div className="h-2 w-20 rounded-full shadow-[0_0_18px_rgba(249,115,22,0.32)]" style={{ background: course.color }} />
        <h2 className="mt-4 text-2xl font-black text-orange-50">{course.name}</h2>
        <p className="text-slate-400">{course.instructor || 'No instructor listed'}</p>
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
  // Course detail panel groups related child records.
  return (
    <div className="forge-card forge-hover-lift rounded-lg p-5">
      <h3 className="mb-4 text-lg font-bold text-orange-50">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Item({ title, text }) {
  // Compact child-row preview for a task or note.
  return (
    <div className="forge-row-hover rounded-md border border-orange-200/10 bg-black/18 p-3">
      <p className="font-semibold text-orange-50">{title}</p>
      <p className="line-clamp-2 text-sm text-slate-400">{text}</p>
    </div>
  )
}
