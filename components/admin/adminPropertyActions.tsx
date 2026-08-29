'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Props {
  propertyId:   string
  status:       string
  propertyName: string
}

export function AdminPropertyActions({ propertyId, status, propertyName }: Props) {
  const router              = useRouter()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const isApproved  = status === 'approved'
  const isSuspended = status === 'suspended'

  if (!isApproved && !isSuspended) return null

  async function handleAction(suspend: boolean) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}/suspend`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ suspend, reason }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed'); return }
      toast.success(suspend ? 'Property suspended' : 'Property unsuspended')
      setReason('')
      router.refresh()
    } catch { toast.error('Network error') }
    finally { setLoading(false) }
  }

  return (
    <div className="flex gap-3 flex-wrap">
      {isApproved && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 border-destructive/30 text-destructive hover:border-destructive/60 hover:bg-destructive/5"
              disabled={loading}
            >
              <ShieldAlert className="h-4 w-4" />
              Suspend property
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Suspend {propertyName}?</AlertDialogTitle>
              <AlertDialogDescription>
                This property will be hidden from all listings immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-1.5 py-2">
              <Label className="text-xs font-medium">Reason (optional)</Label>
              <Textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Reason for suspension..."
                className="resize-none h-20 text-sm"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleAction(true)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Suspend'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {isSuspended && (
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => handleAction(false)}
          disabled={loading}
        >
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <ShieldCheck className="h-4 w-4" />
          }
          Unsuspend property
        </Button>
      )}
    </div>
  )
}