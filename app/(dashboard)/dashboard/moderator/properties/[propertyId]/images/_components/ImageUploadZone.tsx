'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PendingImage {
  id:      string
  file:    File
  preview: string
}

interface ImageUploadZoneProps {
  unitTypeId:    string
  unitTypeLabel: string
  onImagesReady: (unitTypeId: string, images: PendingImage[]) => void
  existingCount: number
}

const MAX_IMAGES    = 8
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function ImageUploadZone({
  unitTypeId, unitTypeLabel, onImagesReady, existingCount,
}: ImageUploadZoneProps) {
  const [pending, setPending]   = useState<PendingImage[]>([])
  const [dragging, setDragging] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const inputRef                = useRef<HTMLInputElement>(null)
  const remaining               = MAX_IMAGES - existingCount - pending.length

  // Notify parent AFTER render — never during
  useEffect(() => {
    onImagesReady(unitTypeId, pending)
  }, [pending, unitTypeId])

  function processFiles(files: FileList | File[]) {
    setError(null)
    const arr = Array.from(files)

    if (arr.length > remaining) {
      setError(`You can only add ${remaining} more image${remaining !== 1 ? 's' : ''} to this unit type`)
      return
    }

    const invalid = arr.filter(f => !f.type.startsWith('image/'))
    if (invalid.length > 0) { setError('Only image files are allowed'); return }

    const tooBig = arr.filter(f => f.size > MAX_FILE_SIZE)
    if (tooBig.length > 0) { setError('Each image must be under 5MB'); return }

    const newPending: PendingImage[] = arr.map(file => ({
      id:      `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }))

    setPending(prev => [...prev, ...newPending])
  }

  function removeImage(id: string) {
    setPending(prev => {
      const img = prev.find(p => p.id === id)
      if (img) URL.revokeObjectURL(img.preview)
      return prev.filter(p => p.id !== id)
    })
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }, [remaining])

  const onDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(true) }, [])
  const onDragLeave = useCallback(() => setDragging(false), [])

  return (
    <div className="flex flex-col gap-3">

      {remaining > 0 && (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-all',
            dragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          )}
        >
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Drop images here or <span className="text-primary">browse</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              PNG, JPG, WEBP · Max 5MB each · {remaining} slot{remaining !== 1 ? 's' : ''} remaining
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => e.target.files && processFiles(e.target.files)}
          />
        </div>
      )}

      {remaining === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Maximum images reached for {unitTypeLabel}
        </p>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {pending.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {pending.map((img, i) => (
            <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={img.preview}
                alt={`Preview ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 left-1">
                <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-500 text-white">
                  Pending
                </span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); removeImage(img.id) }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}