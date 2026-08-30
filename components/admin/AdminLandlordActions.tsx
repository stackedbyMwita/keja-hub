'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, ShieldAlert, ShieldCheck, Ban, CheckCircle2, ArrowDownCircle } from 'lucide-react'
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
  landlordId:   string
  landlordName: string
  isActive:     boolean
  isBanned:     boolean
}

export function AdminLandlordActions({ landlordId, landlordName, isActive, isBanned }: Props) {
  const router              = useRouter()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  async function call(endpoint: string, body: object, successMsg: string) {
    setLoading(endpoint)
    try {
      const res = await fetch(`/api/admin/landlords/${landlordId}/${endpoint}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed'); return }
      toast.success(successMsg)
      setReason('')
      router.refresh()
    } catch { toast.error('Network error') }
    finally { setLoading(null) }
  }

  return (
    <div className="flex flex-wrap gap-3">

      {/* Suspend / Unsuspend */}
      {!isBanned && (
        isActive ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400" disabled={!!loading}>
                <ShieldAlert className="h-4 w-4" />
                Suspend
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Suspend {landlordName}?</AlertDialogTitle>
                <AlertDialogDescription>
                  All their approved properties will be hidden from listings. They can still log in.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex flex-col gap-1.5 py-2">
                <Label className="text-xs font-medium">Reason (optional)</Label>
                <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason..." className="resize-none h-20 text-sm" />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => call('suspend', { suspend: true, reason }, 'Landlord suspended')}>
                  Suspend
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button variant="outline" className="gap-2" onClick={() => call('suspend', { suspend: false }, 'Landlord unsuspended')} disabled={!!loading}>
            {loading === 'suspend' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Unsuspend
          </Button>
        )
      )}

      {/* Ban / Unban */}
      {isBanned ? (
        <Button variant="outline" className="gap-2" onClick={() => call('ban', { ban: false }, 'Landlord unbanned')} disabled={!!loading}>
          {loading === 'ban' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Unban
        </Button>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2 border-destructive/30 text-destructive hover:border-destructive/60 hover:bg-destructive/5" disabled={!!loading}>
              <Ban className="h-4 w-4" />
              Ban
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ban {landlordName}?</AlertDialogTitle>
              <AlertDialogDescription>
                They will be immediately redirected to /banned and lose access to the platform. All their listings will be hidden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-1.5 py-2">
              <Label className="text-xs font-medium">Reason (optional)</Label>
              <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for ban..." className="resize-none h-20 text-sm" />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => call('ban', { ban: true, reason }, 'Landlord banned')}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Ban
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Downgrade to user */}
      {!isBanned && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2 border-destructive/30 text-destructive hover:border-destructive/60" disabled={!!loading}>
              <ArrowDownCircle className="h-4 w-4" />
              Downgrade to user
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Downgrade {landlordName} to user?</AlertDialogTitle>
              <AlertDialogDescription>
                They will lose all landlord privileges. Their properties will be suspended and they cannot create new listings. This cannot be automatically undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-1.5 py-2">
              <Label className="text-xs font-medium">Reason (optional)</Label>
              <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for downgrade..." className="resize-none h-20 text-sm" />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => call('downgrade', { reason }, 'Landlord downgraded to user')}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Downgrade
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

    </div>
  )
}