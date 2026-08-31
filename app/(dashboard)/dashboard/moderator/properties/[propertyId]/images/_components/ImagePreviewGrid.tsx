'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Star, Trash2, Loader2, StarOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ConfirmDialog } from '@/components/Components/ConfirmDialog'
import { Button } from '@/components/ui/button'

interface UnitImage {
  id:                  string
  image_url:      string
  cloudinary_image_id: string
  is_cover:            boolean
  created_at:          string
}

interface ImagePreviewGridProps {
  images:     UnitImage[]
  propertyId: string
  unitTypeId: string
}

export function ImagePreviewGrid({ images, propertyId, unitTypeId }: ImagePreviewGridProps) {
  const router                        = useRouter()
  const [settingCover, setSettingCover] = useState<string | null>(null)
  const [deleting, setDeleting]         = useState<string | null>(null)

  async function handleSetCover(imageId: string) {
    setSettingCover(imageId)
    try {
      const res = await fetch(
        `/api/moderator/properties/${propertyId}/images/${imageId}/cover`,
        { method: 'PATCH' }
      )
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to set cover'); return }
      toast.success('Cover image updated')
      router.refresh()
    } catch { toast.error('Network error') }
    finally { setSettingCover(null) }
  }

  async function handleDelete(imageId: string) {
    setDeleting(imageId)
    try {
      const res = await fetch(
        `/api/moderator/properties/${propertyId}/images/${imageId}`,
        { method: 'DELETE' }
      )
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to delete'); return }
      toast.success('Image deleted')
      router.refresh()
    } catch { toast.error('Network error') }
    finally { setDeleting(null) }
  }

  if (images.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4">
        No images uploaded yet. Use the upload zone above.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
      {images.map((image) => (
        <div
          key={image.id}
          className={cn(
            'relative group aspect-square rounded-lg overflow-hidden bg-muted ring-2 transition-all',
            image.is_cover ? 'ring-primary' : 'ring-transparent'
          )}
        >
          <img
            src={image.image_url}
            alt="Unit image"
            className="w-full h-full object-cover"
          />

          {/* Cover badge */}
          {image.is_cover && (
            <div className="absolute top-1 left-1">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-primary text-primary-foreground">
                <Star className="h-2.5 w-2.5" />
                Cover
              </span>
            </div>
          )}

          {/* Hover actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">

            {/* Set as cover */}
            {!image.is_cover && (
              <button
                onClick={() => handleSetCover(image.id)}
                disabled={!!settingCover}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
                title="Set as cover"
              >
                {settingCover === image.id
                  ? <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                  : <Star className="h-3.5 w-3.5 text-white" />
                }
              </button>
            )}

            {/* Delete */}
            <ConfirmDialog
              trigger={
                <button
                  disabled={!!deleting}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-destructive/80 flex items-center justify-center transition-colors"
                  title="Delete image"
                >
                  {deleting === image.id
                    ? <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                    : <Trash2 className="h-3.5 w-3.5 text-white" />
                  }
                </button>
              }
              title="Delete this image?"
              description={
                image.is_cover
                  ? 'This is the cover image. The next image will automatically become the cover.'
                  : 'This image will be permanently deleted.'
              }
              confirmLabel="Delete"
              onConfirm={() =>handleDelete(image.id)}
            />

          </div>
        </div>
      ))}
    </div>
  )
}