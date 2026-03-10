'use client'

import { useState, useEffect } from 'react'
import { Upload, Tags, Search, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

const STORAGE_KEY = 'case-file-walkthrough-dismissed'

const steps = [
  {
    icon: Upload,
    label: 'Collect',
    description: 'Upload documents, photos, and records related to your case.',
  },
  {
    icon: Tags,
    label: 'Organize',
    description: 'Tag and categorize your evidence so nothing gets lost.',
  },
  {
    icon: Search,
    label: 'Discover',
    description: 'Search across everything to find what you need quickly.',
  },
  {
    icon: FileText,
    label: 'Prepare',
    description: 'Build your arguments with organized, ready-to-use evidence.',
  },
]

interface BeginnerWalkthroughProps {
  onStart: () => void
}

export function BeginnerWalkthrough({ onStart }: BeginnerWalkthroughProps) {
  const [visible, setVisible] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== 'true') {
      setVisible(true)
    }
  }, [])

  function handleStart() {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true')
    }
    setVisible(false)
    onStart()
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-lg border-calm-indigo/20 bg-white shadow-xl">
        <CardContent className="space-y-5 px-6 py-6">
          {/* Title */}
          <h2 className="text-lg font-semibold text-foreground">
            Welcome to Your Case File
          </h2>

          {/* Description */}
          <p className="text-sm text-muted-foreground">
            This is where you&apos;ll organize everything for your case. Think
            of it like building a filing cabinet:
          </p>

          {/* 2x2 Step Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.label}
                className="flex flex-col items-center gap-2 rounded-lg border border-calm-indigo/15 bg-calm-indigo/5 p-3 text-center"
              >
                <step.icon className="h-5 w-5 text-calm-indigo" />
                <span className="text-sm font-medium text-foreground">
                  {step.label}
                </span>
                <span className="text-xs text-muted-foreground leading-snug">
                  {step.description}
                </span>
              </div>
            ))}
          </div>

          {/* Reassurance */}
          <p className="text-xs text-muted-foreground">
            Don&apos;t worry about getting it perfect &mdash; you can always
            reorganize later. The important thing is to start gathering what you
            have.
          </p>

          {/* CTA */}
          <Button
            onClick={handleStart}
            className="w-full bg-calm-indigo text-white hover:bg-calm-indigo/90"
          >
            Let&apos;s start with collecting evidence
          </Button>

          {/* Don't show again */}
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={dontShowAgain}
              onCheckedChange={(checked) =>
                setDontShowAgain(checked === true)
              }
            />
            <span className="text-xs text-muted-foreground select-none">
              Don&apos;t show this again
            </span>
          </label>
        </CardContent>
      </Card>
    </div>
  )
}
