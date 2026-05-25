import { Bot, BookMarked, ChevronLeft, ChevronRight, Flame, ListChecks, TimerReset } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import EmptyState from '../components/EmptyState'
import { formatDate } from '../utils/formatDate'

export default function Dashboard() {
  // Dashboard loads one aggregated backend payload instead of calling every resource route.
  const [data, setData] = useState(null)
  const [activeModule, setActiveModule] = useState(0)

  useEffect(() => {
    api.get('/dashboard').then((response) => setData(response.data))
  }, [])

  if (!data) return <div className="forge-muted">Loading dashboard...</div>

  const carouselSections = [
    {
      title: 'Upcoming tasks',
      to: '/tasks',
      action: 'View tasks',
      content: data.upcoming_tasks.length ? (
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
      ),
    },
    {
      title: 'Recent study sets',
      to: '/study-sets',
      action: 'Review sets',
      content: data.recent_study_sets.length ? (
        <div className="space-y-3">
          {data.recent_study_sets.map((studySet) => (
            <Link key={studySet.id} to={`/study-sets?set=${studySet.id}`} className="forge-row-hover block rounded-md border border-orange-200/10 bg-black/18 p-3">
              <p className="font-semibold text-orange-50">{studySet.title}</p>
              <p className="text-sm text-slate-400">{studySet.item_count} items · {studySet.set_type}</p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="No study sets yet" message="Generate flashcards or quizzes from AI Forge." />
      ),
    },
    {
      title: 'Course focus',
      to: '/courses',
      action: 'View courses',
      content: data.course_summaries.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.course_summaries.map((course) => (
            <Link key={course.id} to={`/courses/${course.id}`} className="forge-row-hover rounded-md border border-orange-200/10 bg-black/18 p-3">
              <div className="mb-3 h-1.5 w-14 rounded-full" style={{ background: course.color }} />
              <p className="font-semibold text-orange-50">{course.name}</p>
              <p className="text-sm text-slate-400">{course.subject || 'No subject listed'}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-300/75">
                {course.task_count} tasks · {course.note_count} notes · {course.study_set_count} sets
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="No courses yet" message="Create courses to organize your academic forge." />
      ),
    },
    {
      title: 'Recent notes',
      to: '/notes',
      action: 'View notes',
      content: data.recent_notes.length ? (
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
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300/75">Command center</p>
        <h2 className="forge-page-title mt-1">Dashboard</h2>
        <p className="text-sm text-slate-400">{data.productivity_tip}</p>
      </div>

      <section className="forge-card-hot forge-hover-lift rounded-lg p-5">
        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-md bg-orange-500/15 text-amber-300">
                <Flame size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300/75">Today’s Forge</p>
                <h3 className="text-xl font-black text-orange-50">{data.next_action}</h3>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <FocusItem label="Next task" value={data.next_task?.title || 'No upcoming tasks'} detail={data.next_task?.due_date ? formatDate(data.next_task.due_date) : 'Plan one when you are ready.'} to="/tasks" />
              <FocusItem label="Weekly study" value={`${data.study_minutes_this_week}/${data.weekly_study_goal} min`} detail={`${data.weekly_study_percentage}% of your weekly goal`} to="/study-sessions" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <QuickLink icon={ListChecks} label="Plan tasks" to="/tasks" />
            <QuickLink icon={TimerReset} label="Start timer" to="/study-sessions" />
            <QuickLink icon={Bot} label="Ask AI Forge" to="/ai-chat" />
            <QuickLink icon={BookMarked} label="Review study sets" to="/study-sets" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Courses" value={data.course_count} to="/courses" />
        <Stat label="Tasks" value={data.task_count} to="/tasks" />
        <Stat label="Completed" value={`${data.completed_task_percentage}%`} to="/tasks" meter={data.completed_task_percentage} />
        <Stat label="Study minutes" value={data.study_minutes_this_week} to="/study-sessions" meter={data.weekly_study_percentage} />
        <Stat label="Study sets" value={data.study_set_count} to="/study-sets" />
      </section>

      <DashboardCarousel sections={carouselSections} activeIndex={activeModule} onChange={setActiveModule} />
    </div>
  )
}

function FocusItem({ label, value, detail, to }) {
  return (
    <Link to={to} className="forge-row-hover rounded-md border border-orange-200/10 bg-black/18 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300/75">{label}</p>
      <p className="mt-2 font-black text-orange-50">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{detail}</p>
    </Link>
  )
}

function QuickLink({ icon: Icon, label, to }) {
  return (
    <Link to={to} className="forge-row-hover flex items-center gap-3 rounded-md border border-orange-200/10 bg-black/18 px-3 py-2 text-sm font-bold text-orange-50">
      <Icon className="text-amber-300" size={18} />
      {label}
    </Link>
  )
}

function Stat({ label, value, to, meter }) {
  // Compact metric card used for top-level dashboard totals.
  return (
    <Link to={to} className="forge-card-hot forge-hover-lift block rounded-lg p-5 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
      <p className="text-sm font-semibold text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-amber-200">{value}</p>
      {typeof meter === 'number' && <Meter value={meter} />}
    </Link>
  )
}

function Meter({ value }) {
  return (
    <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/30">
      <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500" style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  )
}

function DashboardCarousel({ sections, activeIndex, onChange }) {
  // Condenses dashboard preview modules into a single guided carousel.
  const activeSection = sections[activeIndex]
  const goToPrevious = () => onChange((activeIndex - 1 + sections.length) % sections.length)
  const goToNext = () => onChange((activeIndex + 1) % sections.length)

  return (
    <section className="forge-card forge-hover-lift rounded-lg p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300/75">
            Module {activeIndex + 1} of {sections.length}
          </p>
          <Link to={activeSection.to} className="mt-1 inline-block text-xl font-black text-orange-50 transition hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            {activeSection.title}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link to={activeSection.to} className="forge-button-subtle px-3 py-2 text-sm font-bold">
            {activeSection.action}
          </Link>
          <button type="button" onClick={goToPrevious} className="forge-button inline-grid h-10 w-10 place-items-center p-0" aria-label="Previous dashboard module">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={goToNext} className="forge-button inline-grid h-10 w-10 place-items-center p-0" aria-label="Next dashboard module">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="min-h-[18rem] rounded-lg border border-orange-200/10 bg-black/15 p-4">
        {activeSection.content}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {sections.map((section, index) => (
          <button
            key={section.title}
            type="button"
            onClick={() => onChange(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === activeIndex ? 'w-10 bg-gradient-to-r from-amber-300 to-orange-500 shadow-[0_0_18px_rgba(245,158,11,0.45)]' : 'w-2.5 bg-slate-500/70 hover:bg-amber-300/70'
            }`}
            aria-label={`Show ${section.title}`}
            aria-current={index === activeIndex ? 'true' : undefined}
          />
        ))}
      </div>
    </section>
  )
}
