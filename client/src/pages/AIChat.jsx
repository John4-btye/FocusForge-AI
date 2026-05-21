import { Bot, BookMarked, HelpCircle, ListChecks, NotebookTabs, Send, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAI } from '../ai/AIContext'

const quickPrompts = [
  // Preset prompts speed up common student AI requests.
  {
    label: 'Flashcards',
    icon: NotebookTabs,
    prompt: 'Create 8 flashcards from this topic or notes: ',
  },
  {
    label: 'Quiz',
    icon: ListChecks,
    prompt: 'Create a 10-question quiz with an answer key about: ',
  },
  {
    label: 'Navigation',
    icon: HelpCircle,
    prompt: 'Help me navigate FocusForge AI. I want to: ',
  },
  {
    label: 'Study plan',
    icon: Sparkles,
    prompt: 'Make a focused study plan for this goal: ',
  },
]

export default function AIChat() {
  // AI Forge uses the same shared chat state as the global floating assistant.
  const {
    error,
    fillQuickPrompt,
    input,
    loading,
    messages,
    sendMessage,
    setInput,
    setShowGlobalAi,
    showGlobalAi,
  } = useAI()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300/75">AI study assistant</p>
        <h2 className="forge-page-title mt-1">AI Forge</h2>
        <p className="mt-1 text-sm text-slate-400">
          Generate flashcards, quizzes, study plans, explanations, and navigation help.
        </p>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        {quickPrompts.map(({ label, icon: Icon, prompt }) => (
          <button
            key={label}
            type="button"
            onClick={() => fillQuickPrompt(prompt)}
            className="forge-card forge-hover-lift flex items-center gap-3 rounded-lg p-4 text-left text-orange-50 transition hover:border-orange-200/30 hover:bg-orange-400/5"
          >
            <Icon className="text-amber-300" size={20} />
            <span className="font-bold">{label}</span>
          </button>
        ))}
      </section>

      <Link to="/study-sets" className="forge-card forge-hover-lift flex items-center gap-3 rounded-lg p-4 text-orange-50">
        <BookMarked className="text-amber-300" size={20} />
        <span className="font-bold">Generate and save Quizlet-style study sets</span>
      </Link>

      <label className="forge-card forge-row-hover flex items-center justify-between gap-4 rounded-lg p-4 text-sm font-semibold text-slate-300">
        <span>
          <span className="block font-black text-orange-50">Show AI Forge on every screen</span>
          <span className="mt-1 block text-slate-400">Keep the assistant available globally while you move through the app.</span>
        </span>
        <input
          type="checkbox"
          className="h-5 w-5 accent-orange-500"
          checked={showGlobalAi}
          onChange={(event) => setShowGlobalAi(event.target.checked)}
        />
      </label>

      <section className="forge-card-hot forge-hover-lift flex min-h-[34rem] flex-col rounded-lg">
        <div className="flex items-center gap-3 border-b border-orange-200/10 px-5 py-4">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-orange-500/15 text-amber-300 shadow-[0_0_24px_rgba(249,115,22,0.18)]">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-black text-orange-50">FocusForge Assistant</h3>
            <p className="text-xs text-slate-400">Powered by Groq + GPT-OSS 120B</p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl whitespace-pre-wrap rounded-lg px-4 py-3 text-sm leading-6 ${
                  message.role === 'user'
                    ? 'bg-orange-500 text-[#160c05] shadow-[0_12px_28px_rgba(249,115,22,0.22)]'
                    : 'border border-orange-200/10 bg-black/24 text-slate-200'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="max-w-xl rounded-lg border border-orange-200/10 bg-black/24 px-4 py-3 text-sm text-slate-400">
              Heating the forge...
            </div>
          )}
        </div>

        <div className="border-t border-orange-200/10 p-4">
          {error && (
            <p className="mb-3 rounded-md border border-red-300/20 bg-red-950/40 p-3 text-sm text-red-200">
              {error}
            </p>
          )}
          <form
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage()
            }}
            className="flex gap-3"
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="forge-input min-h-12 flex-1 resize-none px-3 py-3"
              placeholder="Ask for flashcards, a quiz, study help, or app guidance..."
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="forge-button inline-flex h-12 items-center gap-2 px-4"
            >
              <Send size={18} />
              Send
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
