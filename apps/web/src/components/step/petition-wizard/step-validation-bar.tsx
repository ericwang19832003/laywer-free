import { Card, CardContent } from '@/components/ui/card'
import { GlossaryTooltip } from './glossary-tooltip'

interface Block {
  field: string
  message: string
}

interface Warning {
  condition: string
  message: string
}

interface GlossaryHit {
  term: string
  plainEnglish: string
}

interface StepValidationBarProps {
  blocks: Block[]
  warnings: Warning[]
  glossaryHits: GlossaryHit[]
}

export function StepValidationBar({
  blocks,
  warnings,
  glossaryHits,
}: StepValidationBarProps) {
  const hasContent =
    blocks.length > 0 || warnings.length > 0 || glossaryHits.length > 0

  if (!hasContent) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* Blocks — stronger amber styling */}
      {blocks.map((block, i) => (
        <Card
          key={`block-${i}`}
          className="border-amber-300 bg-amber-50"
        >
          <CardContent className="p-4">
            <p className="text-sm font-medium text-amber-800">
              {block.message}
            </p>
          </CardContent>
        </Card>
      ))}

      {/* Warnings — lighter amber hints */}
      {warnings.map((warning, i) => (
        <Card
          key={`warning-${i}`}
          className="border-amber-200 bg-amber-50/60"
        >
          <CardContent className="p-4">
            <p className="text-sm text-amber-700">{warning.message}</p>
          </CardContent>
        </Card>
      ))}

      {/* Glossary hits — terms to know */}
      {glossaryHits.length > 0 && (
        <Card className="border-calm-indigo/20 bg-calm-indigo/5">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-warm-muted mb-2">
              Terms to know
            </p>
            <ul className="space-y-1.5">
              {glossaryHits.map((hit, i) => (
                <li key={`glossary-${i}`} className="text-sm text-warm-text">
                  <GlossaryTooltip
                    term={hit.term}
                    plainEnglish={hit.plainEnglish}
                  />
                  <span className="text-warm-muted ml-1.5">
                    — {hit.plainEnglish}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
