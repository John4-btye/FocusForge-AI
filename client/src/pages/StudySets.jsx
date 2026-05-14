import { Brain, CheckCircle2, ListChecks, NotebookTabs, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import { useToast } from '../toast/ToastContext'

const initialGenerator = {
  // Default generator settings for new AI-created collections.
  topic: '',
  set_type: 'flashcards',
  count: 8,
  course_id: '',
}

export default function StudySets() {
  // Study Sets manages generation preview, saved collections, and selected collection view.
  const [courses, setCourses] = useState([])
  const [studySets, setStudySets] = useState([])
  const [selectedSet, setSelectedSet] = useState(null)
  const [generatedSet, setGeneratedSet] = useState(null)
  const [generator, setGenerator] = useState(initialGenerator)
  const [deletingSet, setDeletingSet] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

  async function loadStudySets() {
    // Reload saved collection metadata after save or delete.
    const response = await api.get('/study-sets')
    setStudySets(response.data)
  }

  useEffect(() => {
    api.get('/courses').then((response) => setCourses(response.data))
    api.get('/study-sets').then((response) => setStudySets(response.data))
  }, [])

  async function generateSet(event) {
    // Generation creates a preview only; the user chooses whether to save it.
    event.preventDefault()
    setLoading(true)
    setError('')
    setGeneratedSet(null)

    try {
      const response = await api.post('/ai/generate-study-set', {
        topic: generator.topic,
        set_type: generator.set_type,
        count: generator.count,
      })
      setGeneratedSet(response.data)
      toast.success('Study set generated.')
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to generate a study set.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function saveGeneratedSet() {
    // Saving persists the current preview as a user-owned StudySet.
    if (!generatedSet) return

    setSaving(true)
    setError('')
    try {
      const response = await api.post('/study-sets', {
        ...generatedSet,
        course_id: generator.course_id || null,
      })
      setSelectedSet(response.data)
      setGeneratedSet(null)
      setGenerator(initialGenerator)
      loadStudySets()
      toast.success('Study set saved.')
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to save study set.'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  async function openStudySet(id) {
    // Detail fetch includes study set items, unlike the lightweight list payload.
    const response = await api.get(`/study-sets/${id}`)
    setSelectedSet(response.data)
  }

  async function confirmDelete() {
    // Deleting a saved set also clears the viewer if that set was selected.
    if (!deletingSet) return
    setSaving(true)
    try {
      await api.delete(`/study-sets/${deletingSet.id}`)
      if (selectedSet?.id === deletingSet.id) {
        setSelectedSet(null)
      }
      setDeletingSet(null)
      loadStudySets()
      toast.success('Study set deleted.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to delete study set.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300/75">Generated collections</p>
        <h2 className="forge-page-title mt-1">Study Sets</h2>
        <p className="mt-1 text-sm text-slate-400">
          Generate Quizlet-style flashcard and quiz collections, then save them for later review.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={generateSet} className="forge-card-hot forge-hover-lift rounded-lg p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-orange-500/15 text-amber-300">
              <Brain size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-orange-50">Generate a set</h3>
              <p className="text-sm text-slate-400">Enter a topic and let AI Forge shape the first draft.</p>
            </div>
          </div>

          {error && (
            <p className="mt-5 rounded-md border border-red-300/20 bg-red-950/40 p-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <label className="mt-5 block text-sm font-semibold text-orange-100/90">
            Topic or search prompt
            <textarea
              value={generator.topic}
              onChange={(event) => setGenerator({ ...generator, topic: event.target.value })}
              className="forge-input mt-2 min-h-28 px-3 py-2"
              placeholder="Example: Python functions and loops, cellular respiration, U.S. Constitution..."
              required
            />
          </label>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <select className="forge-input px-3 py-2" value={generator.set_type} onChange={(event) => setGenerator({ ...generator, set_type: event.target.value })}>
              <option value="flashcards">Flashcards</option>
              <option value="quiz">Quiz</option>
            </select>
            <input className="forge-input px-3 py-2" type="number" min="3" max="20" value={generator.count} onChange={(event) => setGenerator({ ...generator, count: Number(event.target.value) })} />
            <select className="forge-input px-3 py-2" value={generator.course_id} onChange={(event) => setGenerator({ ...generator, course_id: event.target.value })}>
              <option value="">No course</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
            </select>
          </div>

          <button disabled={loading} className="forge-button mt-5 inline-flex items-center gap-2 px-4 py-2">
            <Brain size={18} />
            {loading ? 'Generating...' : 'Generate set'}
          </button>
        </form>

        <div className="forge-card forge-hover-lift rounded-lg p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-black text-orange-50">Generated preview</h3>
            <button disabled={!generatedSet || saving} onClick={saveGeneratedSet} className="forge-button inline-flex items-center gap-2 px-4 py-2 disabled:opacity-40">
              <Save size={18} />
              {saving ? 'Saving...' : 'Save set'}
            </button>
          </div>
          <StudySetPreview studySet={generatedSet} emptyMessage="Generate a topic to preview flashcards or a quiz here." />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="forge-card forge-hover-lift rounded-lg p-5">
          <h3 className="mb-4 text-lg font-black text-orange-50">Saved collections</h3>
          {studySets.length ? (
            <div className="space-y-3">
              {studySets.map((studySet) => (
                <article key={studySet.id} className="forge-row-hover rounded-md border border-orange-200/10 bg-black/18 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <button type="button" onClick={() => openStudySet(studySet.id)} className="min-w-0 text-left">
                      <p className="font-bold text-orange-50">{studySet.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{studySet.item_count} items · {studySet.set_type}</p>
                    </button>
                    <button onClick={() => setDeletingSet(studySet)} className="forge-button-danger inline-flex items-center gap-2 px-3 py-1 text-sm">
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No saved study sets" message="Generate and save your first collection." />
          )}
        </div>

        <div className="forge-card-hot forge-hover-lift rounded-lg p-5">
          <h3 className="mb-4 text-lg font-black text-orange-50">Collection viewer</h3>
          <StudySetPreview studySet={selectedSet} emptyMessage="Select a saved collection to review it." />
        </div>
      </section>

      <Modal
        isOpen={Boolean(deletingSet)}
        title="Delete study set?"
        onClose={() => setDeletingSet(null)}
        onSubmit={(event) => {
          event.preventDefault()
          confirmDelete()
        }}
        submitLabel="Delete set"
        submitting={saving}
        danger
      >
        <p className="text-sm leading-6 text-slate-300">
          This will permanently delete {deletingSet?.title} and its saved flashcards or quiz questions.
        </p>
      </Modal>
    </div>
  )
}

function StudySetPreview({ studySet, emptyMessage }) {
  // Preview component renders both generated drafts and saved study set details.
  if (!studySet) {
    return <EmptyState title="Nothing selected" message={emptyMessage} />
  }

  const isQuiz = studySet.set_type === 'quiz'
  // Icon and answer layout shift based on whether the set is flashcards or quiz items.
  const Icon = isQuiz ? ListChecks : NotebookTabs

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-orange-500/15 text-amber-300">
          <Icon size={20} />
        </div>
        <div>
          <p className="font-black text-orange-50">{studySet.title}</p>
          <p className="text-sm text-slate-400">{studySet.topic}</p>
        </div>
      </div>

      <div className="space-y-3">
        {(studySet.items || []).map((item, index) => (
          <article key={`${item.prompt}-${index}`} className="forge-row-hover rounded-md border border-orange-200/10 bg-black/18 p-4">
            <div className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-orange-500/15 text-sm font-black text-amber-200">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-orange-50">{item.prompt}</p>
                {Array.isArray(item.choices) && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {item.choices.map((choice) => (
                      <p key={choice} className="forge-row-hover rounded-md border border-orange-200/10 px-3 py-2 text-sm text-slate-300">{choice}</p>
                    ))}
                  </div>
                )}
                <p className="mt-3 flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-amber-300" size={16} />
                  {item.answer}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
