'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface RegenerateConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  saving?: boolean
}

export function RegenerateConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  saving = false,
}: RegenerateConfirmDialogProps) {
  const [confirming, setConfirming] = useState(false)

  const handleConfirm = async () => {
    setConfirming(true)
    try {
      await onConfirm()
    } finally {
      setConfirming(false)
      onOpenChange(false)
    }
  }

  const isDisabled = confirming || saving

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-calm-amber/10 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-calm-amber" />
            </div>
            <DialogTitle>Start fresh?</DialogTitle>
          </div>
          <DialogDescription className="text-warm-muted pt-2">
            This will create a new draft based on your latest answers. Your
            current edits will be saved as a previous version you can go back
            to.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDisabled}
            className="w-full sm:w-auto"
          >
            Keep editing
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDisabled}
            className="w-full sm:w-auto"
          >
            {isDisabled ? 'Saving...' : 'Create new draft'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
