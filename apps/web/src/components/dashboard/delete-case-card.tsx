'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function DeleteCaseCard({ caseId }: { caseId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/cases/${caseId}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/cases')
    } else {
      setDeleting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-5 pb-4 px-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-warm-text">Delete this case</p>
          <p className="text-xs text-warm-muted mt-0.5">This will archive the case and remove it from your dashboard.</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive shrink-0 ml-4">
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this case?</AlertDialogTitle>
              <AlertDialogDescription>
                This will archive the case and remove it from your dashboard. Your data will be preserved but the case will no longer appear in your active cases.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleting ? 'Deleting...' : 'Delete case'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
