'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
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

interface PropertyReviewActionsProps {
  propertyId: string
}

export function PropertyReviewActions({ propertyId }: PropertyReviewActionsProps) {
  const router                          = useRouter()
  const [notes, setNotes]               = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading]           = useState<'approve' | 'reject' | null>(null)
  const [rejectOpen, setRejectOpen]     = useState(false)

  async function handleApprove() {
    setLoading('approve')
    try {
      const res = await fetch(`/api/moderator/properties/${propertyId}/approve`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to approve'); return }
      toast.success('Property approved! The landlord can now activate their units.')
      router.push('/dashboard/moderator/properties')
      router.refresh()
    } catch { toast.error('Network error. Please try again.') }
    finally { setLoading(null) }
  }

  async function handleReject() {
    if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return }
    setLoading('reject')
    try {
      const res = await fetch(`/api/moderator/properties/${propertyId}/reject`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to reject'); return }
      toast.success('Property rejected — landlord has been notified.')
      router.push('/dashboard/moderator/properties')
      router.refresh()
    } catch { toast.error('Network error. Please try again.') }
    finally { setLoading(null); setRejectOpen(false) }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Notes */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Internal notes (optional)
        </Label>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notes about this property — visible to admins and moderators only..."
          className="resize-none h-24 text-sm"
        />
      </div>

      <Separator />

      {/* Action buttons */}
      <div className="flex gap-3">

        {/* Approve */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="flex-1 gap-2" disabled={!!loading}>
              {loading === 'approve'
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <CheckCircle2 className="h-4 w-4" />
              }
              Approve property
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve this property?</AlertDialogTitle>
              <AlertDialogDescription>
                The landlord will be able to activate their units and list them
                on KéjaLink. You can score the property separately after approval.
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
            <Button variant="destructive" className="flex-1 gap-2" disabled={!!loading}>
              {loading === 'reject'
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <XCircle className="h-4 w-4" />
              }
              Reject
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject this property?</AlertDialogTitle>
              <AlertDialogDescription>
                The landlord will be notified and can resubmit after fixing the issues.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-2 py-2">
              <Label className="text-sm font-medium">
                Rejection reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g. Could not verify the property address. Please provide accurate location details."
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

      {/* Scoring note */}
      <p className="text-xs text-muted-foreground text-center">
        After approval, you can score this property from the activity log to improve its ranking.
      </p>

    </div>
  )
}