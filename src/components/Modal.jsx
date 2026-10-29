import { useEffect } from 'react'

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    const handleKeyDown = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-2xl bg-surface p-6"
      >
        <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
          <h2 id="modal-title" className="text-lg text-ink">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 flex h-8 w-8 items-center justify-center rounded-lg text-lg font-normal leading-none text-ink-muted hover:bg-canvas hover:text-ink"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
