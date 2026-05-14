import { Bot, Code2, Database, Flame, Layers, ShieldCheck } from 'lucide-react'
import BrandMark from '../components/BrandMark'

const technologies = [
  'React',
  'Vite',
  'Tailwind CSS',
  'Flask',
  'PostgreSQL',
  'SQLAlchemy',
  'JWT Authentication',
  'Gemini API',
]

const dependencies = [
  'axios',
  'react-router-dom',
  'lucide-react',
  'flask-sqlalchemy',
  'flask-migrate',
  'flask-cors',
  'flask-jwt-extended',
  'psycopg2-binary',
  'python-dotenv',
  'bcrypt',
  'google-genai',
]

export default function About() {
  return (
    <div className="space-y-6">
      <section className="forge-card-hot forge-hover-lift rounded-lg p-6">
        <BrandMark />
        <div className="forge-divider-glow my-6 h-px" />
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300/75">About the project</p>
        <h2 className="forge-page-title mt-2">FocusForge AI</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          FocusForge AI is a full-stack student productivity platform built to help users organize courses,
          manage academic tasks, write notes, track study time, and get AI-powered study support from one
          focused dashboard. The forge theme represents turning effort, time, and raw class material into
          stronger study habits.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <InfoCard icon={Layers} title="Core app">
          Users can create courses, tasks, notes, and study sessions with ownership-based access controls.
        </InfoCard>
        <InfoCard icon={ShieldCheck} title="Authentication">
          The app uses JWT authentication so users can only access and modify their own records.
        </InfoCard>
        <InfoCard icon={Bot} title="AI Forge">
          The chatbot can help create flashcards, quizzes, study plans, explanations, and navigation guidance.
        </InfoCard>
        <InfoCard icon={Flame} title="Study timer">
          Focus sessions include preset durations, custom time, sound choices, and optional global timer display.
        </InfoCard>
        <InfoCard icon={Database} title="Database">
          PostgreSQL stores user-owned courses, tasks, notes, and study session data.
        </InfoCard>
        <InfoCard icon={Code2} title="Capstone focus">
          The project demonstrates RESTful routes, CRUD, pagination, auth, authorization, and an external AI API.
        </InfoCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Technologies used">
          <TagGrid items={technologies} />
        </Panel>
        <Panel title="Main dependencies">
          <TagGrid items={dependencies} />
        </Panel>
      </section>

      <section className="forge-card forge-hover-lift rounded-lg p-5">
        <h3 className="text-lg font-black text-orange-50">How it was made</h3>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          FocusForge AI was built as a React frontend connected to a Flask REST API. The backend defines
          SQLAlchemy models and protected routes for private user data, while the frontend uses reusable pages,
          auth context, theme context, and timer context to manage the user experience. The AI assistant is
          handled server-side so the API key remains outside the browser.
        </p>
      </section>
    </div>
  )
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <article className="forge-card forge-hover-lift rounded-lg p-5">
      <div className="grid h-11 w-11 place-items-center rounded-md bg-orange-500/15 text-amber-300">
        <Icon size={21} />
      </div>
      <h3 className="mt-4 font-black text-orange-50">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{children}</p>
    </article>
  )
}

function Panel({ title, children }) {
  return (
    <div className="forge-card forge-hover-lift rounded-lg p-5">
      <h3 className="mb-4 text-lg font-black text-orange-50">{title}</h3>
      {children}
    </div>
  )
}

function TagGrid({ items }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="forge-row-hover rounded-md border border-orange-200/10 bg-black/18 px-3 py-2 text-sm font-semibold text-slate-300">
          {item}
        </span>
      ))}
    </div>
  )
}
