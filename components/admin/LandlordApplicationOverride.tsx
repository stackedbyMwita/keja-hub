'use client'

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props {
  landlordId:          string
  landlordName:        string
  applicationStatus:   string  // pending / approved / rejected
}

export function LandlordApplicationOverride({
  landlordId, landlordName, applicationStatus,
}: Props) {
  const router              = useRouter()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(action)
    try {
      const res = await fetch(`/api/admin/landlords/${landlordId}/application-override`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action, reason }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed'); return }
      toast.success(action === 'approve'
        ? `✅ ${landlordName} approved as landlord`
        : `❌ ${landlordName}'s application rejected`
      )
      setReason('')
      router.refresh()
    } catch { toast.error('Network error') }
    finally { setLoading(null) }
  }

  const canApprove = ['pending', 'rejected'].includes(applicationStatus)
  const canReject  = ['pending', 'approved'].includes(applicationStatus)

  if (!canApprove && !canReject) return null

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-amber-600" />
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
          Admin override — Landlord application
        </p>
      </div>
      <p className="text-xs text-amber-700 dark:text-amber-300">
        Bypass the moderator queue and directly approve or reject this landlord application.
        Current status: <span className="font-semibold capitalize">{applicationStatus}</span>
      </p>

      <div className="flex gap-3 flex-wrap">

        {/* Approve */}
        {canApprove && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                disabled={!!loading}
              >
                {loading === 'approve'
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <CheckCircle2 className="h-3.5 w-3.5" />
                }
                Approve application
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Approve {landlordName} as landlord?</AlertDialogTitle>
                <AlertDialogDescription>
                  This bypasses the moderator queue. The user will immediately receive landlord
                  access and can start creating properties.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleAction('approve')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Confirm approval
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Reject */}
        {canReject && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm" variant="outline"
                className="gap-2 border-destructive/30 text-destructive hover:border-destructive/60"
                disabled={!!loading}
              >
                {loading === 'reject'
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <XCircle className="h-3.5 w-3.5" />
                }
                Reject application
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject {landlordName}'s application?</AlertDialogTitle>
                <AlertDialogDescription>
                  The applicant will be notified and can resubmit after addressing the issues.
                  {applicationStatus === 'approved' && (
                    <span className="block mt-1 text-destructive font-medium">
                      ⚠️ This landlord is currently approved. Rejecting will revoke their landlord access.
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex flex-col gap-1.5 py-2">
                <Label className="text-xs font-medium">
                  Rejection reason <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Reason the applicant will see..."
                  className="resize-none h-20 text-sm"
                  autoFocus
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleAction('reject')}
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