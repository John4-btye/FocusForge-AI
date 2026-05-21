import { Brain, CheckCircle2, ChevronLeft, ChevronRight, ListChecks, NotebookTabs, RotateCcw, Save, Trash2, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
  const [assigningSetId, setAssigningSetId] = useState(null)
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

  async function assignStudySet(studySet, courseId) {
    // Users can manually attach or detach a saved study set from a course later.
    setAssigningSetId(studySet.id)
    try {
      const response = await api.patch(`/study-sets/${studySet.id}`, {
        course_id: courseId || null,
      })
      setStudySets((current) => current.map((item) => (
        item.id === studySet.id ? { ...item, course_id: response.data.course_id } : item
      )))
      if (selectedSet?.id === studySet.id) {
        setSelectedSet(response.data)
      }
      toast.success(courseId ? 'Study set assigned to course.' : 'Study set removed from course.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to update study set course.')
    } finally {
      setAssigningSetId(null)
    }
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
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <select
                        className="forge-input min-w-36 px-2 py-1 text-sm"
                        value={studySet.course_id || ''}
                        disabled={assigningSetId === studySet.id}
                        onChange={(event) => assignStudySet(studySet, event.target.value)}
                      >
                        <option value="">No course</option>
                        {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
                      </select>
                      <button onClick={() => setDeletingSet(studySet)} className="forge-button-danger inline-flex items-center gap-2 px-3 py-1 text-sm">
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
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
          <StudySetPreview key={selectedSet?.id || 'empty-collection'} studySet={selectedSet} emptyMessage="Select a saved collection to review it." carousel />
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

export function StudySetPreview({ studySet, emptyMessage, carousel = false }) {
  // Preview component renders both generated drafts and saved study set details.
  const carouselRef = useRef(null)
  const dragState = useRef({ active: false, startX: 0, scrollLeft: 0 })
  const [activeIndex, setActiveIndex] = useState(0)
  const [flippedCards, setFlippedCards] = useState({})
  const [selectedAnswers, setSelectedAnswers] = useState({})

  if (!studySet) {
    return <EmptyState title="Nothing selected" message={emptyMessage} />
  }

  const isQuiz = studySet.set_type === 'quiz'
  // Icon and answer layout shift based on whether the set is flashcards or quiz items.
  const Icon = isQuiz ? ListChecks : NotebookTabs
  const items = studySet.items || []
  const answeredCount = Object.keys(selectedAnswers).length
  const correctCount = items.reduce((total, item, index) => (
    normalizeAnswer(selectedAnswers[index]) === normalizeAnswer(item.answer) ? total + 1 : total
  ), 0)

  function updateActiveSlide() {
    if (!carouselRef.current) return
    const { scrollLeft } = carouselRef.current
    const slides = Array.from(carouselRef.current.children)
    const closestIndex = slides.reduce((closest, slide, index) => {
      const currentDistance = Math.abs(slide.offsetLeft - scrollLeft)
      const closestDistance = Math.abs(slides[closest].offsetLeft - scrollLeft)
      return currentDistance < closestDistance ? index : closest
    }, 0)
    setActiveIndex(closestIndex)
  }

  function scrollToSlide(index) {
    if (!carouselRef.current) return
    const nextIndex = Math.max(0, Math.min(index, items.length - 1))
    const nextSlide = carouselRef.current.children[nextIndex]
    carouselRef.current.scrollTo({
      left: nextSlide?.offsetLeft || 0,
      behavior: 'smooth',
    })
    setActiveIndex(nextIndex)
  }

  function startDrag(event) {
    if (!carousel || !carouselRef.current) return
    if (event.target.closest('[data-no-carousel-drag="true"]')) return
    dragState.current = {
      active: true,
      startX: event.pageX,
      scrollLeft: carouselRef.current.scrollLeft,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function dragSlides(event) {
    if (!dragState.current.active || !carouselRef.current) return
    const dragDistance = event.pageX - dragState.current.startX
    if (Math.abs(dragDistance) < 6) return
    event.preventDefault()
    carouselRef.current.scrollLeft = dragState.current.scrollLeft - dragDistance
  }

  function stopDrag() {
    dragState.current.active = false
    updateActiveSlide()
  }

  function toggleFlashcard(index) {
    setFlippedCards((current) => ({ ...current, [index]: !current[index] }))
  }

  function chooseAnswer(index, choice) {
    setSelectedAnswers((current) => {
      if (current[index]) return current
      return { ...current, [index]: choice }
    })
  }

  function resetStudyMode() {
    setFlippedCards({})
    setSelectedAnswers({})
    scrollToSlide(0)
  }

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

      {carousel ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-md border border-orange-200/10 bg-black/18 px-3 py-2">
            <div>
              <p className="text-sm font-semibold text-slate-300">
                Card {items.length ? activeIndex + 1 : 0} of {items.length}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {isQuiz ? `${correctCount}/${items.length} correct · ${answeredCount}/${items.length} answered` : 'Click the card to flip between front and back'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetStudyMode}
                className="forge-button-subtle inline-grid h-9 w-9 place-items-center p-0"
                aria-label="Reset study mode"
              >
                <RotateCcw size={17} />
              </button>
              <button
                type="button"
                onClick={() => scrollToSlide(activeIndex - 1)}
                disabled={activeIndex === 0}
                className="forge-button inline-grid h-9 w-9 place-items-center p-0 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous collection item"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => scrollToSlide(activeIndex + 1)}
                disabled={activeIndex >= items.length - 1}
                className="forge-button inline-grid h-9 w-9 place-items-center p-0 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next collection item"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div
            ref={carouselRef}
            onScroll={updateActiveSlide}
            onPointerDown={startDrag}
            onPointerMove={dragSlides}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
            onPointerLeave={stopDrag}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth rounded-lg pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item, index) => (
              <StudySetItemCard
                key={`${item.prompt}-${index}`}
                item={item}
                index={index}
                carousel
                isQuiz={isQuiz}
                selectedAnswer={selectedAnswers[index]}
                flipped={Boolean(flippedCards[index])}
                onChooseAnswer={(choice) => chooseAnswer(index, choice)}
                onToggleFlip={() => toggleFlashcard(index)}
              />
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {items.map((item, index) => (
              <button
                key={`${item.prompt}-dot-${index}`}
                type="button"
                onClick={() => scrollToSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  activeIndex === index ? 'w-8 bg-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.45)]' : 'w-2.5 bg-slate-600 hover:bg-orange-300/70'
                }`}
                aria-label={`View collection item ${index + 1}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <StudySetItemCard key={`${item.prompt}-${index}`} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}

function StudySetItemCard({
  item,
  index,
  carousel = false,
  isQuiz = false,
  selectedAnswer = '',
  flipped = false,
  onChooseAnswer,
  onToggleFlip,
}) {
  // One reusable item card supports stacked previews and the saved collection carousel.
  if (carousel && !isQuiz) {
    return (
      <article className="flex min-h-80 flex-[0_0_100%] snap-center select-none rounded-md border border-orange-200/10 bg-black/18 p-4 md:p-6">
        <button
          type="button"
          data-no-carousel-drag="true"
          onClick={onToggleFlip}
          className={`forge-row-hover flex w-full flex-col justify-between rounded-md border p-6 text-left transition ${
            flipped ? 'border-amber-300/45 bg-orange-500/10 shadow-[0_0_28px_rgba(251,191,36,0.12)]' : 'border-orange-200/10 bg-black/20'
          }`}
        >
          <span className="text-xs font-black uppercase tracking-[0.22em] text-amber-300/80">
            {flipped ? 'Back' : 'Front'} · Card {index + 1}
          </span>
          <span className="my-8 block text-xl font-black leading-8 text-orange-50">
            {flipped ? item.answer : item.prompt}
          </span>
          <span className="text-sm font-semibold text-slate-400">
            {flipped ? 'Click to return to the prompt' : 'Click to reveal the answer'}
          </span>
        </button>
      </article>
    )
  }

  const answerSelected = Boolean(selectedAnswer)
  const selectedIsCorrect = normalizeAnswer(selectedAnswer) === normalizeAnswer(item.answer)

  return (
    <article className={`forge-row-hover rounded-md border border-orange-200/10 bg-black/18 p-4 ${carousel ? 'min-h-80 flex-[0_0_100%] snap-center select-none md:p-6' : ''}`}>
      <div className="flex gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-orange-500/15 text-sm font-black text-amber-200">
          {index + 1}
        </span>
        <div className="min-w-0">
          <p className="font-bold text-orange-50">{item.prompt}</p>
          {Array.isArray(item.choices) && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {item.choices.map((choice) => {
                const isSelected = selectedAnswer === choice
                const isCorrect = normalizeAnswer(choice) === normalizeAnswer(item.answer)
                const resultClass = answerSelected && isCorrect
                  ? 'border-emerald-300/60 bg-emerald-500/15 text-emerald-100'
                  : answerSelected && isSelected
                    ? 'border-red-300/60 bg-red-500/15 text-red-100'
                    : 'border-orange-200/10 text-slate-300 hover:border-amber-300/45 hover:bg-orange-400/10'

                return carousel ? (
                  <button
                    key={choice}
                    type="button"
                    data-no-carousel-drag="true"
                    onClick={() => onChooseAnswer(choice)}
                    disabled={answerSelected}
                    className={`rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${resultClass} disabled:cursor-default`}
                  >
                    {choice}
                  </button>
                ) : (
                  <p key={choice} className="forge-row-hover rounded-md border border-orange-200/10 px-3 py-2 text-sm text-slate-300">{choice}</p>
                )
              })}
            </div>
          )}
          {(!carousel || !Array.isArray(item.choices) || answerSelected) && (
            <p className={`mt-3 flex items-start gap-2 text-sm leading-6 ${carousel && answerSelected && !selectedIsCorrect ? 'text-red-100' : 'text-slate-300'}`}>
              {carousel && answerSelected && !selectedIsCorrect ? (
                <XCircle className="mt-0.5 shrink-0 text-red-300" size={16} />
              ) : (
                <CheckCircle2 className="mt-0.5 shrink-0 text-amber-300" size={16} />
              )}
              {carousel && answerSelected ? (
                selectedIsCorrect ? `Correct: ${item.answer}` : `Correct answer: ${item.answer}`
              ) : (
                item.answer
              )}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

function normalizeAnswer(value) {
  return String(value || '').trim().toLowerCase()
}
