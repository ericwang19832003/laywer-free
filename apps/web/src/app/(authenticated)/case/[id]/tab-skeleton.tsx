export function TabSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-warm-border bg-white p-5">
          <div className="h-4 w-1/3 rounded bg-warm-border mb-3" />
          <div className="h-3 w-2/3 rounded bg-warm-border/60" />
        </div>
      ))}
    </div>
  )
}
