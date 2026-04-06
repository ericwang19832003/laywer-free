'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

interface UpgradePromptProps {
  feature: string
  description: string
}

export function UpgradePrompt({ feature, description }: UpgradePromptProps) {
  return (
    <Card className="border-calm-indigo/20 bg-calm-indigo/5">
      <CardContent className="pt-6 text-center space-y-3">
        <Sparkles className="h-8 w-8 text-calm-indigo mx-auto" />
        <h3 className="font-semibold text-warm-text">{feature}</h3>
        <p className="text-sm text-warm-muted">{description}</p>
        <Button asChild className="bg-calm-indigo hover:bg-calm-indigo/90">
          <Link href="/settings#billing">Upgrade to Pro</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
