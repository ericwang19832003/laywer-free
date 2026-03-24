'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

export default function AuthenticatedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const errorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log(error.message)
    errorRef.current?.focus()
  }, [error.message])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md border-warm-border text-center" role="alert" ref={errorRef} tabIndex={-1}>
        <CardHeader>
          <h1 className="text-xl font-semibold text-warm-text">
            Something unexpected happened.
          </h1>
          <p className="text-sm text-warm-muted">
            Your work is saved. This is on our end, not yours.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            Try again
          </Button>
          <Button variant="outline" onClick={() => router.push('/cases')}>
            Go to my cases
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-xs text-warm-muted">
            If this keeps happening, let us know.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
