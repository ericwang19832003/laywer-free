'use client'

import { toast as sonnerToast } from 'sonner'

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading' | 'promise'

interface ToastOptions {
  title: string
  description?: string
  type?: ToastType
  action?: {
    label: string
    onClick: () => void
  }
}

export function useAppToast() {
  const success = (title: string, description?: string) => {
    sonnerToast.success(title, {
      description,
      duration: 4000,
    })
  }

  const error = (title: string, description?: string) => {
    sonnerToast.error(title, {
      description,
      duration: 5000,
    })
  }

  const info = (title: string, description?: string) => {
    sonnerToast(title, {
      description,
      duration: 4000,
    })
  }

  const warning = (title: string, description?: string) => {
    sonnerToast.warning(title, {
      description,
      duration: 5000,
    })
  }

  const loading = (title: string, description?: string) => {
    return sonnerToast.loading(title, {
      description,
    })
  }

  const promise = <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
    }
  ) => {
    return sonnerToast.promise(promise, messages)
  }

  const custom = (options: ToastOptions) => {
    sonnerToast(options.title, {
      description: options.description,
      duration: options.type === 'error' ? 5000 : 4000,
    })
  }

  const dismiss = (toastId?: string) => {
    if (toastId) {
      sonnerToast.dismiss(toastId)
    } else {
      sonnerToast.dismiss()
    }
  }

  return {
    success,
    error,
    info,
    warning,
    loading,
    promise,
    custom,
    dismiss,
  }
}

export const toast = {
  success: (title: string, description?: string) => sonnerToast.success(title, { description }),
  error: (title: string, description?: string) => sonnerToast.error(title, { description }),
  info: (title: string, description?: string) => sonnerToast.info(title, { description }),
  warning: (title: string, description?: string) => sonnerToast.warning(title, { description }),
  loading: (title: string) => sonnerToast.loading(title),
  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
}
