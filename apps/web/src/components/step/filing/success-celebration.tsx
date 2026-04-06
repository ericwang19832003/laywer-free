'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, FileText, Shield, FolderOpen } from 'lucide-react'

interface SuccessCelebrationProps {
  caseId: string
  courtType: string
  filingType: 'petition' | 'answer'
}

export function SuccessCelebration({ caseId, courtType, filingType }: SuccessCelebrationProps) {
  return (
    <div className="text-center space-y-6">
      {/* Success icon with green glow */}
      <div className="mx-auto w-16 h-16 rounded-full bg-calm-green/10 flex items-center justify-center shadow-[0_0_24px_rgba(34,197,94,0.15)]">
        <CheckCircle2 className="h-10 w-10 text-calm-green" />
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-warm-text">
          Your {filingType === 'petition' ? 'Petition' : 'Answer'} Has Been Filed!
        </h2>
        <p className="text-sm text-warm-muted mt-2">
          Great work! You&apos;ve completed one of the most important steps in your case.
        </p>
      </div>

      {/* What's Next section */}
      <div className="text-left space-y-3">
        <h3 className="text-sm font-semibold text-warm-text">What Happens Next</h3>

        <Link href={`/case/${caseId}`} className="block">
          <Card className="hover:border-calm-indigo/30 transition-colors">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <FileText className="h-5 w-5 text-calm-indigo shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-warm-text">Serve the other party</p>
                <p className="text-xs text-warm-muted">Deliver court papers to the defendant</p>
              </div>
              <ArrowRight className="h-4 w-4 text-warm-muted shrink-0" />
            </CardContent>
          </Card>
        </Link>

        <Link href={`/case/${caseId}`} className="block">
          <Card className="hover:border-calm-indigo/30 transition-colors">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <Shield className="h-5 w-5 text-calm-indigo shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-warm-text">Track your deadlines</p>
                <p className="text-xs text-warm-muted">Stay on top of important dates</p>
              </div>
              <ArrowRight className="h-4 w-4 text-warm-muted shrink-0" />
            </CardContent>
          </Card>
        </Link>

        <Link href={`/case/${caseId}/evidence`} className="block">
          <Card className="hover:border-calm-indigo/30 transition-colors">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <FolderOpen className="h-5 w-5 text-calm-indigo shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-warm-text">Organize your evidence</p>
                <p className="text-xs text-warm-muted">Upload and categorize supporting documents</p>
              </div>
              <ArrowRight className="h-4 w-4 text-warm-muted shrink-0" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Dashboard button */}
      <Button asChild className="w-full">
        <Link href={`/case/${caseId}`}>Go to Dashboard</Link>
      </Button>
    </div>
  )
}
