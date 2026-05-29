import { CalendarDays, ChevronDown, Clipboard, Flame, Sparkles, Trophy } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { useToast } from '../toast/ToastContext'
import { formatDate } from '../utils/formatDate'

const levelClasses = [
  'border-orange-200/5 bg-slate-800/70',
  'border-orange-300/10 bg-orange-950/90',
  'border-orange-300/20 bg-orange-800/90',
  'border-amber-300/30 bg-orange-500',
  'border-amber-100/70 bg-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.45)]',
]

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const heatmapTiers = [
  { label: 'Cold steel', range: '0 minutes', detail: 'No study sessions were logged that day.' },
  { label: 'First spark', range: '1-29 minutes', detail: 'A short study session or quick review.' },
  { label: 'Warming forge', range: '30-59 minutes', detail: 'A focused session with steady progress.' },
  { label: 'Hot ember', range: '60-119 minutes', detail: 'A strong study day with deeper work.' },
  { label: 'Full forge', range: '120+ minutes', detail: 'A high-intensity day with major study time.' },
]

export default function Heatmap() {
  // Heatmap turns saved study sessions into a portfolio-style yearly activity board.
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [heatmap, setHeatmap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTierGuide, setShowTierGuide] = useState(false)
  const toast = useToast()

  useEffect(() => {
    api
      .get(`/heatmap?year=${year}`)
      .then((response) => setHeatmap(response.data))
      .catch(() => toast.error('Unable to load your study heatmap.'))
      .finally(() => setLoading(false))
  }, [toast, year])

  const monthLabels = useMemo(() => {
    if (!heatmap?.days?.length) return []
    const labels = []
    const seen = new Set()
    heatmap.days.forEach((day) => {
      if (day.day <= 7 && !seen.has(day.month)) {
        seen.add(day.month)
        labels.push({ month: day.month, week: day.week })
      }
    })
    return labels
  }, [heatmap])

  function handleYearChange(event) {
    setLoading(true)
    setYear(Number(event.target.value))
  }

  async function copySnapshot() {
    if (!heatmap) return
    const { summary } = heatmap
    const text = `FocusForge Heatmap ${heatmap.year}: ${summary.total_minutes} study minutes, ${summary.active_days} active days, ${summary.current_streak}-day current streak, ${summary.longest_streak}-day longest streak.`

    try {
      await navigator.clipboard.writeText(text)
      toast.success('Heatmap snapshot copied.')
    } catch {
      toast.error('Unable to copy snapshot.')
    }
  }

  if (loading) return <div className="forge-muted">Loading heatmap...</div>
  if (!heatmap) return <div className="forge-muted">Unable to load heatmap.</div>

  const { summary } = heatmap

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300/75">Consistency forged</p>
          <h2 className="forge-page-title mt-1">Heatmap</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Track how often you study, build visible streaks, and turn your focus history into a shareable academic portfolio snapshot.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select className="forge-input px-3 py-2" value={year} onChange={handleYearChange}>
            {[currentYear, currentYear - 1, currentYear - 2].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button type="button" onClick={copySnapshot} className="forge-button flex items-center gap-2 px-4 py-2 font-bold">
            <Clipboard size={17} />
            Copy snapshot
          </button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Flame} label="Current streak" value={`${summary.current_streak} days`} />
        <Metric icon={Trophy} label="Longest streak" value={`${summary.longest_streak} days`} />
        <Metric icon={CalendarDays} label="Active days" value={summary.active_days} />
        <Metric icon={Sparkles} label="Study time" value={`${summary.total_minutes} min`} detail={`${summary.total_hours} total hours`} />
      </section>

      <section className="forge-card-hot forge-hover-lift overflow-hidden rounded-lg p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-2xl font-black text-orange-50">{summary.total_sessions} study sessions in {heatmap.year}</h3>
            <p className="mt-1 text-sm text-slate-400">Each ember represents study minutes logged on that day.</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <span key={level} className={`h-4 w-4 rounded-sm border ${levelClasses[level]}`} />
              ))}
              <span>More</span>
            </div>
            <button
              type="button"
              onClick={() => setShowTierGuide((current) => !current)}
              className="flex items-center gap-2 rounded-md border border-orange-200/15 bg-black/20 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-200 transition hover:border-amber-300/40 hover:bg-orange-500/10 hover:text-amber-100"
              aria-expanded={showTierGuide}
            >
              Color guide
              <ChevronDown size={15} className={`transition ${showTierGuide ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {showTierGuide && (
          <div className="mb-5 rounded-lg border border-orange-200/15 bg-black/20 p-4 shadow-[0_0_22px_rgba(249,115,22,0.08)]">
            <div className="mb-3 flex items-center gap-2">
              <Flame size={17} className="text-amber-300" />
              <p className="text-sm font-black text-orange-50">How heatmap colors are forged</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {heatmapTiers.map((tier, index) => (
                <div key={tier.label} className="rounded-md border border-white/10 bg-slate-950/35 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`h-4 w-4 rounded-sm border ${levelClasses[index]}`} />
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-amber-200">{tier.label}</span>
                  </div>
                  <p className="text-sm font-black text-orange-50">{tier.range}</p>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-400">{tier.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[48rem]">
            <div className="relative ml-10 mb-2 h-6" style={{ width: `${heatmap.total_weeks * 1.05}rem` }}>
              {monthLabels.map((label) => (
                <span
                  key={`${label.month}-${label.week}`}
                  className="absolute text-xs font-bold text-slate-400"
                  style={{ left: `${label.week * 1.05}rem` }}
                >
                  {label.month}
                </span>
              ))}
            </div>

            <div className="flex gap-3">
              <div className="grid grid-rows-7 gap-1 pt-0 text-xs font-bold text-slate-400">
                {weekdayLabels.map((label, index) => (
                  <span key={label} className="flex h-3.5 items-center">{index % 2 === 1 ? label : ''}</span>
                ))}
              </div>

              <div
                className="grid grid-flow-col grid-rows-7 gap-1"
                style={{ gridTemplateColumns: `repeat(${heatmap.total_weeks}, minmax(0.75rem, 0.75rem))` }}
              >
                {heatmap.days.map((day) => (
                  <div
                    key={day.date}
                    className={`h-3.5 w-3.5 rounded-sm border transition hover:scale-125 hover:ring-2 hover:ring-amber-200/70 ${levelClasses[day.level]}`}
                    style={{ gridColumnStart: day.week + 1, gridRowStart: day.weekday + 1 }}
                    title={`${formatDate(day.date)}: ${day.minutes} minutes across ${day.sessions} session${day.sessions === 1 ? '' : 's'}`}
                    aria-label={`${formatDate(day.date)}: ${day.minutes} study minutes`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="forge-card rounded-lg p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300/75">Best day</p>
          {summary.best_day ? (
            <>
              <h3 className="mt-2 text-xl font-black text-orange-50">{formatDate(summary.best_day.date)}</h3>
              <p className="mt-1 text-sm text-slate-400">
                {summary.best_day.minutes} minutes across {summary.best_day.sessions} session{summary.best_day.sessions === 1 ? '' : 's'}.
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-400">Log your first study session to light the forge.</p>
          )}
        </div>

        <div className="forge-card rounded-lg p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300/75">Portfolio snapshot</p>
          <p className="mt-2 text-lg font-black text-orange-50">
            {summary.active_days ? `${summary.active_days} active study days with ${summary.total_minutes} minutes forged in ${heatmap.year}.` : 'No activity yet for this year.'}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            This board updates automatically whenever you log a manual study session or save a completed focus timer.
          </p>
        </div>
      </section>
    </div>
  )
}

function Metric({ icon: Icon, label, value, detail }) {
  return (
    <div className="forge-card-hot forge-hover-lift rounded-lg p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-orange-500/15 text-amber-300">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-400">{label}</p>
          <p className="text-2xl font-black text-amber-200">{value}</p>
          {detail && <p className="text-xs font-semibold text-slate-500">{detail}</p>}
        </div>
      </div>
    </div>
  )
}
