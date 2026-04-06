"use client"

import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        className: 'font-sans',
      }}
      theme="light"
      richColors
      closeButton
    />
  )
}
