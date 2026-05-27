'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Upload, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PendingImage {
  id:      string
  file:    File
  preview: string
}

interface PendingUpload {
  unitTypeId: string
  images:     PendingImage[]
}

interface UploadConfirmButtonProps {
  propertyId:     string
  pendingUploads: PendingUpload[]
  onSuccess:      () => void
}

export function UploadConfirmButton({
  propertyId, pendingUploads, onSuccess,
}: UploadConfirmButtonProps) {
  const router                  = useRouter()
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  const totalPending = pendingUploads.reduce((a, p) => a + p.images.length, 0)

  async function handleUpload() {
    if (totalPending === 0) return
    setLoading(true)

    let successCount = 0
    let failCount    = 0

    for (const upload of pendingUploads) {
      for (const img of upload.images) {
        try {
          const formData = new FormData()
          formData.append('file', img.file)
          formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
          formData.append('folder', 'kejalink/units')

          const cloudRes = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: 'POST', body: formData }
          )

          if (!cloudRes.ok) {
            failCount++
            console.error('Cloudinary upload failed')
            continue
          }

          const cloudData = await cloudRes.json()
          const imageId   = cloudData.public_id
          const imageUrl  = cloudData.secure_url

          const res = await fetch(`/api/moderator/properties/${propertyId}/images`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              unit_type_id:        upload.unitTypeId,
              cloudinary_image_id: imageId,
              image_url:      imageUrl,
            }),
          })

          if (res.ok) {
            successCount++
          } else {
            failCount++
            const data = await res.json()
            console.error('Upload failed:', data.error)
          }
        } catch (err) {
          failCount++
          console.error('Upload error:', err)
        }
      }
    }

    setLoading(false)

    if (successCount > 0 && failCount === 0) {
      toast.success(`${successCount} image${successCount !== 1 ? 's' : ''} uploaded successfully!`)
      setDone(true)
      onSuccess()
      router.refresh()
    } else if (successCount > 0 && failCount > 0) {
      toast.warning(`${successCount} uploaded, ${failCount} failed. Please retry the failed ones.`)
      router.refresh()
    } else {
      toast.error('All uploads failed. Please try again.')
    }
  }

  if (totalPending === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-foreground text-background shadow-xl border border-border/20">
        <div className="flex flex-col">
          <p className="text-sm font-semibold">
            {totalPending} image{totalPending !== 1 ? 's' : ''} ready to upload
          </p>
          <p className="text-xs opacity-70">
            Click to confirm and save to the listing
          </p>
        </div>

        <Button
          onClick={handleUpload}
          disabled={loading || done}
          size="sm"
          className="bg-background text-foreground hover:bg-background/90 shrink-0"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
          ) : done ? (
            <><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />Done</>
          ) : (
            <><Upload className="h-4 w-4 mr-2" />Upload all</>
          )}
        </Button>
      </div>
    </div>
  )
}