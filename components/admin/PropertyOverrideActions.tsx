'use client'

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface OverrideActionsProps {
  propertyId:   string
  propertyName: string
  status:       string
}

export function PropertyOverrideActions({
  propertyId, propertyName, status,
}: OverrideActionsProps) {
  const router              = useRouter()
  const [reason, setReason] = useState('')
  const [notes, setNotes]   = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  async function handleOverride(action: 'approve' | 'reject') {
    setLoading(action)
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}/override`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action, reason, notes }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed'); return }
      toast.success(action === 'approve'
        ? '✅ Property approved by admin override'
        : '❌ Property rejected by admin override'
      )
      setReason('')
      setNotes('')
      router.refresh()
    } catch { toast.error('Network error') }
    finally { setLoading(null) }
  }

  const canApprove = ['rejected', 'pending_review', 'suspended'].includes(status)
  const canReject  = ['approved', 'pending_review', 'suspended'].includes(status)

  if (!canApprove && !canReject) return null

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-amber-600" />
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
          Admin override
        </p>
      </div>
      <p className="text-xs text-amber-700 dark:text-amber-300">
        Override the moderator's decision. This will be logged and visible in the activity feed.
      </p>

      <div className="flex gap-3 flex-wrap">

        {/* Override approve */}
        {canApprove && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700 text-white" disabled={!!loading}>
                {loading === 'approve'
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <CheckCircle2 className="h-3.5 w-3.5" />
                }
                Override — Approve
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Admin override — Approve {propertyName}?</AlertDialogTitle>
                <AlertDialogDescription>
                  You are overriding the current status ({status}). This will be logged as an admin action.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex flex-col gap-3 py-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium">Notes (optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Reason for override..."
                    className="resize-none h-20 text-sm"
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleOverride('approve')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Confirm approval
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Override reject */}
        {canReject && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2 border-destructive/30 text-destructive hover:border-destructive/60" disabled={!!loading}>
                {loading === 'reject'
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <XCircle className="h-3.5 w-3.5" />
                }
                Override — Reject
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Admin override — Reject {propertyName}?</AlertDialogTitle>
                <AlertDialogDescription>
                  You are overriding the current status ({status}). The landlord will be able to resubmit after fixing the issues.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex flex-col gap-3 py-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium">
                    Rejection reason <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Reason the landlord will see..."
                    className="resize-none h-20 text-sm"
                    autoFocus
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleOverride('reject')}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={!reason.trim()}
                >
                  Confirm rejection
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}


// ── Reassign moderator ────────────────────────────────────────────────────────

interface ReassignModeratorProps {
  propertyId:          string
  propertyName:        string
  currentModeratorId:  string | null
}

export function ReassignModeratorAction({
  propertyId, propertyName, currentModeratorId,
}: ReassignModeratorProps) {
  const router                          = useRouter()
  const [open, setOpen]                 = useState(false)
  const [moderatorId, setModeratorId]   = useState('')
  const [loading, setLoading]           = useState(false)

  async function handleReassign() {
    if (!moderatorId.trim()) { toast.error('Enter a moderator ID'); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}/reassign`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ new_moderator_id: moderatorId.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed'); return }
      toast.success(`Property reassigned to ${data.moderator_name}`)
      setModeratorId('')
      setOpen(false)
      router.refresh()
    } catch { toast.error('Network error') }
    finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <ShieldCheck className="h-3.5 w-3.5" />
          Reassign moderator
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign moderator</DialogTitle>
          <DialogDescription>
            Change which moderator manages images and scoring for {propertyName}.
            {currentModeratorId && (
              <span className="block mt-1 text-xs font-mono text-muted-foreground">
                Current: {currentModeratorId}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium">
              New moderator ID <span className="text-destructive">*</span>
            </Label>
            <Input
              value={moderatorId}
              onChange={e => setModeratorId(e.target.value)}
              placeholder="user_xxxxxxxxxxxxxxxx"
              className="text-sm font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Find moderator IDs in the Moderators page.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleReassign} disabled={loading || !moderatorId.trim()}>
            {loading
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Reassigning...</>
              : 'Confirm reassign'
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}