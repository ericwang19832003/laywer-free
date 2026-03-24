'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { OBJECTION_CARDS } from '@lawyer-free/shared/guided-steps/courtroom/objection-reference'

export function ObjectionCards() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const card = OBJECTION_CARDS[currentIndex]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-warm-text">Common Objections</h3>
        <span className="text-xs text-warm-muted">
          {currentIndex + 1} of {OBJECTION_CARDS.length}
        </span>
      </div>

      <Card className="border-calm-indigo/20">
        <CardContent className="pt-5 space-y-3">
          <h4 className="text-lg font-semibold text-calm-indigo">{card.title}</h4>
          <p className="text-sm text-warm-muted">{card.description}</p>
          <div className="bg-warm-bg rounded-lg p-3">
            <p className="text-xs font-medium text-warm-text mb-1">When to use:</p>
            <p className="text-xs text-warm-muted">{card.whenToUse}</p>
          </div>
          <div className="bg-calm-indigo/5 rounded-lg p-3">
            <p className="text-xs font-medium text-calm-indigo mb-1">Say this:</p>
            <p className="text-xs text-warm-text italic">{card.exampleLanguage}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-3">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="p-2 rounded-full border border-warm-border hover:bg-warm-bg disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 text-warm-text" />
        </button>
        <div className="flex gap-1 items-center">
          {OBJECTION_CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentIndex ? 'w-4 bg-calm-indigo' : 'w-2 bg-warm-border'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setCurrentIndex(prev => Math.min(OBJECTION_CARDS.length - 1, prev + 1))}
          disabled={currentIndex === OBJECTION_CARDS.length - 1}
          className="p-2 rounded-full border border-warm-border hover:bg-warm-bg disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4 text-warm-text" />
        </button>
      </div>
    </div>
  )
}
