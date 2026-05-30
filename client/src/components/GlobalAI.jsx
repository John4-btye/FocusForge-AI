import { Bot, MessageSquareText, Send, Sparkles, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAI } from '../ai/AIContext'

export default function GlobalAI() {
  // Sidebar assistant mirrors AI Forge chat without floating over page content.
  const {
    error,
    input,
    loading,
    messages,
    showGlobalAi,
    sendMessage,
    setInput,
    setShowGlobalAi,
  } = useAI()
  const [isOpen, setIsOpen] = useState(false)

  if (!showGlobalAi) return null

  return (
    <section className="global-ai-card overflow-hidden rounded-lg border border-orange-200/20 backdrop-blur-xl">
      <div className="global-ai-header border-b border-orange-200/10 p-3">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="flex min-w-0 flex-1 items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-amber-300/50"
            aria-expanded={isOpen}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-orange-500/15 text-amber-300 shadow-[0_0_22px_rgba(249,115,22,0.16)]">
              <Bot size={20} />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-300/80">
                <Sparkles size={13} />
                AI Forge
              </span>
              <span className="block truncate text-sm font-black text-orange-50">Ask assistant</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setShowGlobalAi(false)}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-orange-100 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
            aria-label="Hide global AI assistant"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {isOpen ? (
        <div>
          <div className="max-h-64 space-y-3 overflow-y-auto px-3 py-3 [scrollbar-color:rgba(251,191,36,0.45)_rgba(15,23,42,0.5)] [scrollbar-width:thin]">
            {messages.slice(-4).map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[92%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-6 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-orange-500 to-amber-400 text-[#180c04]'
                      : 'global-ai-message border border-orange-200/10 bg-black/26 text-slate-200'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-orange-200/10 bg-black/24 px-3 py-2 text-sm text-slate-300">
                <MessageSquareText size={15} className="text-amber-300" />
                Heating the forge...
              </div>
            )}
          </div>

          <div className="global-ai-composer border-t border-orange-200/10 p-3">
            {error && <p className="mb-2 rounded-md border border-red-300/20 bg-red-950/35 px-3 py-2 text-xs font-semibold text-red-100">{error}</p>}
            <form
              onSubmit={(event) => {
                event.preventDefault()
                sendMessage()
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="forge-input min-w-0 flex-1 px-3 py-2 text-sm"
                placeholder="Ask AI..."
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="forge-button inline-grid h-10 w-10 shrink-0 place-items-center p-0 disabled:opacity-40"
                aria-label="Send AI message"
              >
                <Send size={17} />
              </button>
            </form>
            <Link to="/ai-chat" className="mt-2 inline-block text-xs font-bold text-amber-300 hover:text-orange-200">
              Open full AI Forge
            </Link>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="block w-full px-3 py-2 text-left text-xs font-semibold text-slate-400 transition hover:bg-orange-400/5 hover:text-orange-100"
        >
          Click to open the assistant here.
        </button>
      )}
    </section>
  )
}
