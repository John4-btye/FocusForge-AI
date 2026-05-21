import { Bot, Send, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAI } from '../ai/AIContext'

export default function GlobalAI() {
  // Floating assistant mirrors the AI Forge chat when the user keeps global AI enabled.
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

  if (!showGlobalAi) return null

  return (
    <div className="forge-card-hot fixed bottom-5 left-5 z-40 flex max-h-[32rem] w-[min(24rem,calc(100vw-2rem))] flex-col rounded-lg backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3 border-b border-orange-200/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-orange-500/15 text-amber-300">
            <Bot size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300/75">AI Forge</p>
            <Link to="/ai-chat" className="text-sm font-black text-orange-50 hover:text-amber-300">
              FocusForge Assistant
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowGlobalAi(false)}
          className="rounded-md p-1 text-slate-400 hover:bg-white/5 hover:text-orange-100"
          aria-label="Hide global AI assistant"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.slice(-5).map((message, index) => (
          <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[88%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-6 ${
                message.role === 'user'
                  ? 'bg-orange-500 text-[#160c05]'
                  : 'border border-orange-200/10 bg-black/24 text-slate-200'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="rounded-lg border border-orange-200/10 bg-black/24 px-3 py-2 text-sm text-slate-400">
            Heating the forge...
          </div>
        )}
      </div>

      <div className="border-t border-orange-200/10 p-3">
        {error && <p className="mb-2 text-xs font-semibold text-red-100">{error}</p>}
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
            placeholder="Ask AI Forge..."
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="forge-button inline-grid h-10 w-10 place-items-center p-0 disabled:opacity-40"
            aria-label="Send AI message"
          >
            <Send size={17} />
          </button>
        </form>
      </div>
    </div>
  )
}
