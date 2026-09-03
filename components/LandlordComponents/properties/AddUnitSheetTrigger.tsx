'use client'

import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { useState } from 'react'
import { AddUnitSheet } from './AddUnitSheet'

interface Props {
  propertyId:    string
  existingTypes: string[]
}

export function AddUnitSheetTriggerClient({ propertyId, existingTypes }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="rounded-full gap-1.5 shrink-0">
        <PlusCircle className="h-3.5 w-3.5" />
        Add unit type
      </Button>
      <AddUnitSheet
        open={open}
        onClose={() => setOpen(false)}
        propertyId={propertyId}
        existingTypes={existingTypes}
      />
    </>
  )
}