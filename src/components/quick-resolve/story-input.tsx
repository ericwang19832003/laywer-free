'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Upload } from 'lucide-react'
import type { AnalysisResult } from '@/lib/schemas/quick-resolve'

interface StoryInputProps {
  onAnalysisComplete: (result: AnalysisResult) => void
}

export function StoryInput({ onAnalysisComplete }: StoryInputProps) {
  const [story, setStory] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const charCount = story.length
  const isValid = charCount >= 50 && charCount <= 5000

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...dropped])
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  async function handleSubmit() {
    if (!isValid || loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/quick-resolve/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong. Please try again.')
      }

      const result: AnalysisResult = await res.json()
      onAnalysisComplete(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-warm-text mb-2">
          What happened?
        </h2>
        <p className="text-warm-muted">
          Describe your situation in your own words. We&apos;ll analyze it and draft a letter for you.
        </p>
      </div>

      <Card className="bg-white border-warm-border">
        <CardContent className="pt-6">
          <div className="relative">
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Tell us what happened..."
              rows={8}
              maxLength={5000}
              className="w-full resize-none rounded-lg border border-warm-border bg-warm-bg px-4 py-3 text-sm text-warm-text placeholder:text-warm-muted focus:outline-none focus:ring-2 focus:ring-calm-indigo/40 focus:border-calm-indigo transition-colors"
            />
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs ${charCount < 50 ? 'text-calm-amber' : 'text-warm-muted'}`}>
                {charCount < 50
                  ? `${50 - charCount} more characters needed`
                  : `${charCount} / 5,000 characters`}
              </span>
              {charCount > 4500 && (
                <span className="text-xs text-calm-amber">
                  {5000 - charCount} remaining
                </span>
              )}
            </div>
          </div>

          {/* File drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors ${
              dragOver
                ? 'border-calm-indigo bg-calm-indigo/5'
                : 'border-warm-border hover:border-warm-muted'
            }`}
          >
            <Upload className="h-5 w-5 text-warm-muted mb-2" />
            <p className="text-xs text-warm-muted text-center">
              Drag &amp; drop supporting documents here (optional)
            </p>
          </div>

          {/* Attached files */}
          {files.length > 0 && (
            <div className="mt-3 space-y-1">
              {files.map((file, i) => (
                <div key={`${file.name}-${i}`} className="flex items-center justify-between rounded-md bg-warm-bg px-3 py-1.5">
                  <span className="text-xs text-warm-text truncate mr-2">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-xs text-warm-muted hover:text-warm-text transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="mt-3 text-sm text-calm-amber">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="w-full mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing your situation...
              </>
            ) : (
              'Analyze my situation \u2192'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
