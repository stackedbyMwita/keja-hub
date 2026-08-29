'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, XCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Props {
  moderatorId:   string
  isActive:      boolean
  moderatorName: string
}

export function AdminModeratorDetailActions({ moderatorId, isActive, moderatorName }: Props) {
  const router          = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/moderators/${moderatorId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ is_active: !isActive }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed'); return }
      toast.success(isActive ? 'Moderator deactivated' : 'Moderator reactivated')
      router.refresh()
    } catch { toast.error('Network error') }
    finally { setLoading(false) }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className={isActive
            ? 'gap-2 border-destructive/30 text-destructive hover:border-destructive/60 hover:bg-destructive/5'
            : 'gap-2'
          }
          disabled={loading}
        >
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : isActive
            ? <XCircle className="h-4 w-4" />
            : <CheckCircle2 className="h-4 w-4" />
          }
          {isActive ? 'Deactivate moderator' : 'Reactivate moderator'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? 'Deactivate' : 'Reactivate'} {moderatorName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActive
              ? 'This moderator will immediately lose access to their dashboard.'
              : 'This moderator will regain access to their dashboard.'
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleToggle}
            className={isActive
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              : ''
            }
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}