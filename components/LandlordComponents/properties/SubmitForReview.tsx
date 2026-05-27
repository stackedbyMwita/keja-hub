'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Loader2, Send } from 'lucide-react'
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

interface SubmitForReviewProps {
  propertyId: string
  hasUnits:   boolean
}

export function SubmitForReview({ propertyId, hasUnits }: SubmitForReviewProps) {
  const router            = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    try {
      const res = await fetch(`/api/landlord/properties/${propertyId}/submit`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success('Submitted for review! Our team will get back to you in 1–3 days.')
      router.refresh()
    } catch { toast.error('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
      <div>
        <p className="text-sm font-semibold text-foreground">Ready to submit?</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          Once submitted, our moderators will review your property, contact you to verify,
          and activate your listing within 1–3 business days.
        </p>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button disabled={!hasUnits || loading} className="w-full sm:w-auto">
            {loading
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
              : <><Send className="h-4 w-4 mr-2" />Submit for review</>
            }
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit for review?</AlertDialogTitle>
            <AlertDialogDescription>
              You won&apos;t be able to edit this property while it&apos;s under review.
              Make sure all your details are correct before submitting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Yes, submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!hasUnits && (
        <p className="text-xs text-destructive">
          Add at least one unit type before submitting.
        </p>
      )}
    </div>
  )
}