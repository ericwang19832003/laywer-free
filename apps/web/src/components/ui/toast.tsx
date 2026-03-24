'use client'

import * as React from 'react'
import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

interface Toast {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (props: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...props, id }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  )
}

function ToastViewport() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss()
    }, toast.duration || 5000)
    return () => clearTimeout(timer)
  }, [toast.duration, onDismiss])

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  }
  const Icon = icons[toast.type]

  const styles = {
    success: 'border-calm-green/30 bg-calm-green/10',
    error: 'border-destructive/20 bg-destructive/5',
    info: 'border-primary/20 bg-primary/5',
    warning: 'border-calm-amber/30 bg-calm-amber/10',
  }

  const iconColors = {
    success: 'text-calm-green',
    error: 'text-destructive',
    info: 'text-primary',
    warning: 'text-calm-amber',
  }

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-full',
        styles[toast.type]
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColors[toast.type])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-warm-text">{toast.title}</p>
        {toast.description && (
          <p className="text-sm text-warm-muted mt-1">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 rounded-md p-1 hover:bg-warm-border/40 transition-colors"
      >
        <X className="h-4 w-4 text-warm-muted" />
      </button>
    </div>
  )
}
