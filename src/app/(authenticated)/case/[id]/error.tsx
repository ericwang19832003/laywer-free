'use client'

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="text-center space-y-4 pt-20">
          <h1 className="text-xl font-semibold text-warm-text">
            Something went wrong loading your dashboard.
          </h1>
          <p className="text-sm text-warm-muted">
            Your case data is safe &mdash; this is a temporary issue.
          </p>
          <button
            onClick={reset}
            className="mt-4 inline-flex items-center rounded-lg bg-calm-indigo px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-calm-indigo/90"
          >
            Try again
          </button>
        </div>
      </main>
    </div>
  )
}
