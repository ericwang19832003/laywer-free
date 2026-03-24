'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface FAQItem {
  question: string
  answer: string | React.ReactNode
}

export interface FAQAccordionProps {
  items: FAQItem[]
  title?: string
}

export function FAQAccordion({ items, title = 'Common Questions' }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div>
      <p className="text-sm font-medium text-warm-text mb-3">{title}</p>
      <div className="rounded-lg border border-warm-border">
        {items.map((item, i) => (
          <div key={i} className="border-b border-warm-border last:border-b-0">
            <button
              className="w-full flex items-center justify-between py-3 px-4 text-left"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span className="text-sm font-medium text-warm-text pr-4">{item.question}</span>
              <ChevronDown
                className={`h-4 w-4 text-warm-muted shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${openIndex === i ? 'max-h-96 pb-3' : 'max-h-0'}`}
            >
              <div className="text-sm text-warm-muted px-4">
                {typeof item.answer === 'string' ? <p>{item.answer}</p> : item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
