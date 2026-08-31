'use client'

import { useState, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReasonField {
  label?:       string
  placeholder?: string
  required?:    boolean
  type?:        'textarea' | 'input'
}

interface ConfirmDialogProps {
  // Trigger
  trigger:       React.ReactNode

  // Dialog content
  title:         string
  description?:  string | React.ReactNode

  // Confirm button
  confirmLabel?: string
  variant?:      'default' | 'destructive' | 'warning'

  // Optional reason field inside the dialog
  reasonField?:  ReasonField

  // Callbacks
  onConfirm:     (reason?: string) => Promise<void> | void

  // State
  disabled?:     boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = 'Confirm',
  variant      = 'default',
  reasonField,
  onConfirm,
  disabled     = false,
}: ConfirmDialogProps) {
  const [open, setOpen]     = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const confirmBtnCls = {
    default:     '',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    warning:     'bg-amber-600 text-white hover:bg-amber-700',
  }[variant]

  function handleClose() {
    if (loading) return
    setOpen(false)
    setReason('')
    setError('')
  }

  async function handleConfirm() {
    // Validate reason if required
    if (reasonField?.required && !reason.trim()) {
      setError(`${reasonField.label ?? 'This field'} is required`)
      return
    }

    setLoading(true)
    setError('')
    try {
      await onConfirm(reason.trim() || undefined)
      setOpen(false)
      setReason('')
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={v => { if (!v) handleClose(); else setOpen(true) }}>
      <AlertDialogTrigger asChild disabled={disabled}>
        {trigger}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription asChild={typeof description !== 'string'}>
              {typeof description === 'string'
                ? description
                : <div>{description}</div>
              }
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {/* Optional reason field */}
        {reasonField && (
          <div className="flex flex-col gap-1.5 py-1">
            <Label className="text-xs font-medium">
              {reasonField.label ?? 'Reason'}
              {reasonField.required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
            {reasonField.type === 'input' ? (
              <Input
                value={reason}
                onChange={e => { setReason(e.target.value); setError('') }}
                placeholder={reasonField.placeholder ?? 'Enter reason...'}
                className={cn('text-sm', error && 'border-destructive')}
                disabled={loading}
                autoFocus
              />
            ) : (
              <Textarea
                value={reason}
                onChange={e => { setReason(e.target.value); setError('') }}
                placeholder={reasonField.placeholder ?? 'Enter reason...'}
                className={cn('resize-none h-24 text-sm', error && 'border-destructive')}
                disabled={loading}
                autoFocus
              />
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={e => { e.preventDefault(); handleConfirm() }}
            disabled={loading}
            className={confirmBtnCls}
          >
            {loading
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
              : confirmLabel
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}