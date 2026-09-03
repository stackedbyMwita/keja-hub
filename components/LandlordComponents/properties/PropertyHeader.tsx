'use client'

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { EditPropertySheet } from './EditPropertySheet'

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft:          'secondary',
  pending_review: 'outline',
  approved:       'default',
  rejected:       'destructive',
  suspended:      'destructive',
}

const STATUS_LABELS: Record<string, string> = {
  draft:          'Draft',
  pending_review: 'In Review',
  approved:       'Approved',
  rejected:       'Rejected',
  suspended:      'Suspended',
}

interface PropertyHeaderProps {
  propertyId: string
  name:        string
  location:    string
  county:      string
  status:      string
  description: string | null
  address:     string | null
  canEdit:     boolean
  canDelete:   boolean
}

export function PropertyHeader({
  propertyId, name, location, county, status,
  description, address, canEdit, canDelete,
}: PropertyHeaderProps) {
  const router = useRouter()
  const [editOpen, setEditOpen]     = useState(false)
  const [deleting, setDeleting]     = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/landlord/properties/${propertyId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to delete'); return }
      toast.success('Property deleted')
      router.push('/dashboard/landlord/properties')
      router.refresh()
    } catch { toast.error('Network error') }
    finally { setDeleting(false) }
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold text-foreground">{name}</h1>
            <Badge variant={STATUS_VARIANTS[status] ?? 'secondary'} className='rounded-full'>
              {STATUS_LABELS[status] ?? status}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {location}, {county}
          </div>
          {address && (
            <p className="text-xs text-muted-foreground">{address}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {canEdit && (
            <Button
              variant="outline" size="sm"
              onClick={() => setEditOpen(true)}
              className="gap-1.5 rounded-full"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}

          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this property?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &quot;{name}&quot; and all its unit types.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? 'Deleting...' : 'Yes, delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <EditPropertySheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        propertyId={propertyId}
        defaultValues={{ name, description, county, location, address }}
      />
    </>
  )
}