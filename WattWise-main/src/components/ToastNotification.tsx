import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { useEffect } from 'react'
import { useWattWise } from '../context/WattWiseContext'

export function ToastNotification() {
  const { toast, clearToast } = useWattWise()

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(clearToast, 3200)
    return () => window.clearTimeout(timer)
  }, [toast, clearToast])

  if (!toast) return null

  const Icon =
    toast.tone === 'success' ? CheckCircle2 : toast.tone === 'warning' ? TriangleAlert : Info
  const toneClass =
    toast.tone === 'success'
      ? 'border-cyan-blue bg-white text-deep-blue'
      : toast.tone === 'warning'
        ? 'border-orange bg-white text-dark-text'
        : 'border-primary-blue bg-white text-dark-text'

  return (
    <div className={`fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg animate-fade-up ${toneClass}`}>
      <Icon className="mt-0.5 size-5 shrink-0 text-orange" />
      <p className="text-sm font-medium">{toast.message}</p>
      <button type="button" onClick={clearToast} className="ml-2 text-dark-text/50 hover:text-dark-text" aria-label="Dismiss">
        <X className="size-4" />
      </button>
    </div>
  )
}
