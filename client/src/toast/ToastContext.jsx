/* eslint-disable react-refresh/only-export-components */
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

const toastStyles = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-300/25 bg-emerald-950/40 text-emerald-100',
  },
  error: {
    icon: AlertTriangle,
    className: 'border-red-300/25 bg-red-950/50 text-red-100',
  },
  info: {
    icon: Info,
    className: 'border-orange-200/20 bg-[#111722]/95 text-orange-50',
  },
}

export function ToastProvider({ children }) {
  // Toasts live globally so any page can report success/error without prop drilling.
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((type, message) => {
    // Each toast removes itself after a short delay, but can also be dismissed manually.
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, type, message }])
    window.setTimeout(() => dismiss(id), 3600)
  }, [dismiss])

  const value = useMemo(
    () => ({
      success: (message) => showToast('success', message),
      error: (message) => showToast('error', message),
      info: (message) => showToast('info', message),
    }),
    [showToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-24 z-[60] w-[min(24rem,calc(100vw-2rem))] space-y-3">
        {toasts.map((toast) => {
          const style = toastStyles[toast.type] || toastStyles.info
          const Icon = style.icon
          return (
            <div
              key={toast.id}
              className={`${style.className} rounded-lg border p-4 shadow-[0_18px_50px_rgba(0,0,0,0.32),0_0_26px_rgba(249,115,22,0.12)] backdrop-blur-xl`}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 shrink-0 text-amber-300" size={18} />
                <p className="flex-1 text-sm font-semibold leading-6">{toast.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className="rounded-md p-1 text-current opacity-70 transition hover:bg-white/10 hover:opacity-100"
                  aria-label="Dismiss notification"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider')
  }
  return context
}
