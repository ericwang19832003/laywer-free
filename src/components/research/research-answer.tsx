'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CitationCard } from './citation-card'

interface Citation {
  case_name: string
  court: string
  year: number | null
  excerpt: string
  opinion_type: string
}

interface ResearchAnswerProps {
  answer: string
  citations: Citation[]
}

export function ResearchAnswer({ answer, citations }: ResearchAnswerProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold" style={{ color: '#1C1917' }}>
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: '#292524' }}
          >
            {answer}
          </div>
        </CardContent>
      </Card>

      {citations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold" style={{ color: '#1C1917' }}>
            Supporting Cases ({citations.length})
          </h4>
          {citations.map((citation, i) => (
            <CitationCard key={i} citation={citation} />
          ))}
        </div>
      )}

      <p className="text-xs" style={{ color: '#A8A29E' }}>
        This analysis is based on case law excerpts and is for educational purposes only. It is not legal advice.
      </p>
    </div>
  )
}
