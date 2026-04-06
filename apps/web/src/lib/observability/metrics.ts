interface MetricEntry {
  name: string
  value: number
  tags?: Record<string, string>
  timestamp: string
}

const counters = new Map<string, number>()
const gauges = new Map<string, number>()

function metricKey(name: string, tags?: Record<string, string>): string {
  if (!tags || Object.keys(tags).length === 0) return name
  const sorted = Object.entries(tags)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(',')
  return `${name}|${sorted}`
}

export const metrics = {
  increment(name: string, tags?: Record<string, string>) {
    const key = metricKey(name, tags)
    counters.set(key, (counters.get(key) ?? 0) + 1)
  },

  timing(name: string, durationMs: number, tags?: Record<string, string>) {
    const entry: MetricEntry = {
      name,
      value: durationMs,
      tags,
      timestamp: new Date().toISOString(),
    }
    console.log(JSON.stringify({ metric: 'timing', ...entry }))
  },

  gauge(name: string, value: number, tags?: Record<string, string>) {
    const key = metricKey(name, tags)
    gauges.set(key, value)
  },

  /** Snapshot current counters and gauges (useful for diagnostics endpoints). */
  snapshot(): { counters: Record<string, number>; gauges: Record<string, number> } {
    return {
      counters: Object.fromEntries(counters),
      gauges: Object.fromEntries(gauges),
    }
  },
}

// Pre-defined metric name constants
export const METRIC = {
  AI_GENERATION_REQUEST: 'ai.generation.request',
  AI_GENERATION_SUCCESS: 'ai.generation.success',
  AI_GENERATION_ERROR: 'ai.generation.error',
  AI_GENERATION_DURATION: 'ai.generation.duration_ms',
  CRON_RUN_SUCCESS: 'cron.run.success',
  CRON_RUN_ERROR: 'cron.run.error',
  API_REQUEST: 'api.request',
  API_ERROR: 'api.error',
  DEADLINE_AUTO_GENERATED: 'deadline.auto_generated',
  DEADLINE_GENERATION_FAILED: 'deadline.generation_failed',
} as const
