import { BookMarked } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import EmptyState from '../components/EmptyState'
import { StudySetPreview } from './StudySets'

export default function CourseDetails() {
  // Course detail fetches one course plus its related tasks, notes, and study sets.
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [selectedStudySet, setSelectedStudySet] = useState(null)

  useEffect(() => {
    api.get(`/courses/${id}`).then((response) => {
      setCourse(response.data)
      setSelectedStudySet(null)
    })
  }, [id])

  if (!course) return <div className="forge-muted">Loading course...</div>

  async function openStudySet(studySetId) {
    // Detail fetch includes the saved flashcards or quiz questions for in-course review.
    const response = await api.get(`/study-sets/${studySetId}`)
    setSelectedStudySet(response.data)
  }

  return (
    <div className="space-y-6">
      <div className="forge-card-hot forge-hover-lift rounded-lg p-5">
        <div className="h-2 w-20 rounded-full shadow-[0_0_18px_rgba(249,115,22,0.32)]" style={{ background: course.color }} />
        <h2 className="mt-4 text-2xl font-black text-orange-50">{course.name}</h2>
        <p className="text-slate-400">{course.instructor || 'No subject listed'}</p>
      </div>
      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Course tasks">
          {course.tasks.length ? course.tasks.map((task) => <Item key={task.id} title={task.title} text={task.priority} />) : <EmptyState title="No tasks" message="Tasks for this course will appear here." />}
        </Panel>
        <Panel title="Course notes">
          {course.notes.length ? course.notes.map((note) => <Item key={note.id} title={note.title} text={note.content} />) : <EmptyState title="No notes" message="Notes for this course will appear here." />}
        </Panel>
      </section>
      <Panel title="Course study sets">
        {course.study_sets.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {course.study_sets.map((studySet) => (
              <button
                key={studySet.id}
                type="button"
                onClick={() => openStudySet(studySet.id)}
                className={`forge-row-hover rounded-md border bg-black/18 p-3 text-left ${
                  selectedStudySet?.id === studySet.id ? 'border-amber-300/60' : 'border-orange-200/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <BookMarked className="mt-1 shrink-0 text-amber-300" size={18} />
                  <div>
                    <p className="font-semibold text-orange-50">{studySet.title}</p>
                    <p className="text-sm text-slate-400">{studySet.item_count} items · {studySet.set_type}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState title="No study sets" message="Assigned flashcard and quiz collections for this course will appear here." />
        )}
      </Panel>
      {selectedStudySet && (
        <div className="forge-card-hot forge-hover-lift rounded-lg p-5">
          <h3 className="mb-4 text-lg font-bold text-orange-50">Study set viewer</h3>
          <StudySetPreview key={selectedStudySet.id} studySet={selectedStudySet} emptyMessage="Select a study set to review." carousel />
        </div>
      )}
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
