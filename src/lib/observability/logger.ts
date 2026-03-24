type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  [key: string]: unknown
}

function formatEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): string {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  }
  return JSON.stringify(entry)
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    console.log(formatEntry('debug', message, context))
  },

  info(message: string, context?: Record<string, unknown>) {
    console.log(formatEntry('info', message, context))
  },

  warn(message: string, context?: Record<string, unknown>) {
    console.warn(formatEntry('warn', message, context))
  },

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    console.error(
      formatEntry('error', message, {
        ...context,
        error_name: error?.name,
        error_message: error?.message,
        stack: error?.stack,
      })
    )
  },
}
