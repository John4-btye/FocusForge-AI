import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import EmptyState from '../components/EmptyState'
import { formatDate } from '../utils/formatDate'

export default function Dashboard() {
  // Dashboard loads one aggregated backend payload instead of calling every resource route.
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/dashboard').then((response) => setData(response.data))
  }, [])

  if (!data) return <div className="forge-muted">Loading dashboard...</div>

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300/75">Command center</p>
        <h2 className="forge-page-title mt-1">Dashboard</h2>
        <p className="text-sm text-slate-400">{data.productivity_tip}</p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Courses" value={data.course_count} to="/courses" />
        <Stat label="Tasks" value={data.task_count} to="/tasks" />
        <Stat label="Completed" value={`${data.completed_task_percentage}%`} to="/tasks" />
        <Stat label="Study minutes" value={data.study_minutes_this_week} to="/study-sessions" />
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Upcoming tasks" to="/tasks">
          {data.upcoming_tasks.length ? (
            <div className="space-y-3">
              {data.upcoming_tasks.map((task) => (
                <Link key={task.id} to="/tasks" className="forge-row-hover block rounded-md border border-orange-200/10 bg-black/18 p-3">
                  <p className="font-semibold text-orange-50">{task.title}</p>
                  <p className="text-sm text-slate-400">{formatDate(task.due_date)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No upcoming tasks" message="Add a task to start planning your week." />
          )}
        </Panel>
        <Panel title="Recent notes" to="/notes">
          {data.recent_notes.length ? (
            <div className="space-y-3">
              {data.recent_notes.map((note) => (
                <Link key={note.id} to="/notes" className="forge-row-hover block rounded-md border border-orange-200/10 bg-black/18 p-3">
                  <p className="font-semibold text-orange-50">{note.title}</p>
                  <p className="line-clamp-2 text-sm text-slate-400">{note.content}</p>
                </Link>
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

function Stat({ label, value, to }) {
  // Compact metric card used for top-level dashboard totals.
  return (
    <Link to={to} className="forge-card-hot forge-hover-lift block rounded-lg p-5 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
      <p className="text-sm font-semibold text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-amber-200">{value}</p>
    </Link>
  )
}

function Panel({ title, to, children }) {
  // Shared dashboard panel wrapper for task/note preview sections.
  return (
    <div className="forge-card forge-hover-lift rounded-lg p-5">
      <Link to={to} className="mb-4 inline-block text-lg font-bold text-orange-50 transition hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
        {title}
      </Link>
      {children}
    </div>
  )
}
