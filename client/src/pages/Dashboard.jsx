import { useEffect, useState } from 'react'
import api from '../api/axios'
import EmptyState from '../components/EmptyState'
import { formatDate } from '../utils/formatDate'

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/dashboard').then((response) => setData(response.data))
  }, [])

  if (!data) return <div className="text-slate-600">Loading dashboard...</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Dashboard</h2>
        <p className="text-sm text-slate-600">{data.productivity_tip}</p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Courses" value={data.course_count} />
        <Stat label="Tasks" value={data.task_count} />
        <Stat label="Completed" value={`${data.completed_task_percentage}%`} />
        <Stat label="Study minutes" value={data.study_minutes_this_week} />
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Upcoming tasks">
          {data.upcoming_tasks.length ? (
            <div className="space-y-3">
              {data.upcoming_tasks.map((task) => (
                <div key={task.id} className="rounded-md border border-slate-200 p-3">
                  <p className="font-medium text-slate-900">{task.title}</p>
                  <p className="text-sm text-slate-500">{formatDate(task.due_date)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No upcoming tasks" message="Add a task to start planning your week." />
          )}
        </Panel>
        <Panel title="Recent notes">
          {data.recent_notes.length ? (
            <div className="space-y-3">
              {data.recent_notes.map((note) => (
                <div key={note.id} className="rounded-md border border-slate-200 p-3">
                  <p className="font-medium text-slate-900">{note.title}</p>
                  <p className="line-clamp-2 text-sm text-slate-500">{note.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No notes yet" message="Capture lecture notes or study ideas here." />
          )}
        </Panel>
      </section>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-950">{title}</h3>
      {children}
    </div>
  )
}
