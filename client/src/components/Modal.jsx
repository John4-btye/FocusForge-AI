import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  submitting = false,
  danger = false,
}) {
  useEffect(() => {
    if (!isOpen) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const Body = onSubmit ? 'form' : 'div'

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="forge-card-hot forge-hover-lift w-full max-w-xl rounded-lg">
        <div className="flex items-center justify-between gap-4 border-b border-orange-200/10 px-5 py-4">
          <h3 className="text-lg font-black text-orange-50">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-400 transition hover:bg-white/5 hover:text-orange-100"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <Body
          onSubmit={onSubmit}
          className="space-y-4 px-5 py-5"
        >
          {children}

          {(onSubmit || onClose) && (
            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="forge-button-subtle px-4 py-2 font-bold">
                {cancelLabel}
              </button>
              {onSubmit && (
                <button
                  type="submit"
                  disabled={submitting}
                  className={`${danger ? 'forge-button-danger' : 'forge-button'} px-4 py-2 disabled:opacity-40`}
                >
                  {submitting ? 'Working...' : submitLabel}
                </button>
              )}
            </div>
          )}
        </Body>
      </div>
    </div>
  )
}
