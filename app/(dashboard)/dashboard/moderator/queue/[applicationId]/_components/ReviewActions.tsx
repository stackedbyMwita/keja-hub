'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import { Separator } from '@/components/ui/separator'

interface ReviewActionsProps {
  applicationId: string
}

export function ReviewActions({ applicationId }: ReviewActionsProps) {
  const router = useRouter()
  const [notes, setNotes]               = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading]           = useState<'approve' | 'reject' | null>(null)
  const [rejectOpen, setRejectOpen]     = useState(false)

  async function handleApprove() {
    setLoading('approve')
    try {
      const res = await fetch('/api/moderator/approve', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, notes }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to approve'); return }
      toast.success('Application approved — landlord account activated!')
      router.push('/dashboard/moderator/queue')
      router.refresh()
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return }
    setLoading('reject')
    try {
      const res = await fetch('/api/moderator/reject', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, reason: rejectReason }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to reject'); return }
      toast.success('Application rejected — landlord has been notified.')
      router.push('/dashboard/moderator/queue')
      router.refresh()
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(null)
      setRejectOpen(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Moderator notes */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Internal notes (optional)
        </Label>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add notes about this review — visible to admins and moderators only..."
          className="resize-none h-24 text-sm"
        />
      </div>

      <Separator />

      {/* Action buttons */}
      <div className="flex gap-3">

        {/* Approve */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="flex-1 gap-2"
              disabled={!!loading}
            >
              {loading === 'approve'
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <CheckCircle2 className="h-4 w-4" />
              }
              Approve
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve this application?</AlertDialogTitle>
              <AlertDialogDescription>
                This will activate the landlord&apos;s account immediately.
                They will be able to list properties on KejaHub. This action
                cannot be undone without admin intervention.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleApprove}>
                Yes, approve
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reject */}
        <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="flex-1 gap-2"
              disabled={!!loading}
            >
              {loading === 'reject'
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <XCircle className="h-4 w-4" />
              }
              Reject
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject this application?</AlertDialogTitle>
              <AlertDialogDescription>
                The landlord will be notified with your reason and can resubmit
                after addressing the issues.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex flex-col gap-2 py-2">
              <Label className="text-sm font-medium">
                Rejection reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g. Could not verify property ownership. Please provide proof of ownership documents."
                className="resize-none h-24 text-sm"
                autoFocus
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReject}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Confirm rejection
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  )
}