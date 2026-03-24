'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'
import Link from 'next/link'

interface EmailsCardProps {
  caseId: string
}

export function EmailsCard({ caseId }: EmailsCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="h-4 w-4 text-warm-muted" />
          <h3 className="text-sm font-semibold text-warm-text">Email Monitor</h3>
        </div>
        <p className="text-xs mb-3 text-warm-muted">
          Monitor opposing counsel communications. Connect your Gmail to automatically track and organize case-related emails.
        </p>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/case/${caseId}/emails`}>Open Emails &rarr;</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
