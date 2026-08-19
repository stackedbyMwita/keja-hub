'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Building2, MapPin, Search, Loader2,
  ShieldAlert, ShieldCheck, Star, Clock,
  CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; variant: any; icon: any }> = {
  draft:          { label: 'Draft',      variant: 'secondary',   icon: AlertCircle  },
  pending_review: { label: 'Pending',    variant: 'outline',     icon: Clock        },
  approved:       { label: 'Approved',   variant: 'default',     icon: CheckCircle2 },
  rejected:       { label: 'Rejected',   variant: 'destructive', icon: XCircle      },
  suspended:      { label: 'Suspended',  variant: 'destructive', icon: ShieldAlert  },
}

async function fetchProperties(status: string, search: string) {
  const params = new URLSearchParams()
  if (status !== 'all') params.set('status', status)
  if (search) params.set('search', search)
  const res = await fetch(`/api/admin/properties?${params}`)
  if (!res.ok) throw new Error('Failed to fetch')
  return (await res.json()).data
}

export default function AdminPropertiesPage() {
  const queryClient          = useQueryClient()
  const [status, setStatus]  = useState('all')
  const [search, setSearch]  = useState('')
  const [reason, setReason]  = useState('')

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['admin-properties', status, search],
    queryFn:  () => fetchProperties(status, search),
  })

  const suspendMutation = useMutation({
    mutationFn: async ({ id, suspend, reason }: { id: string; suspend: boolean; reason?: string }) => {
      const res = await fetch(`/api/admin/properties/${id}/suspend`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ suspend, reason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
    },
    onSuccess: (_, { suspend }) => {
      toast.success(suspend ? 'Property suspended' : 'Property unsuspended')
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] })
      setReason('')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="border-b border-border/50 pb-5">
        <h1 className="text-2xl font-heading font-bold text-foreground">Properties</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {properties.length} propert{properties.length !== 1 ? 'ies' : 'y'} shown
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_review">Pending review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Properties list */}
      <div className="flex flex-col gap-3">
        {properties.map((property: any) => {
          const config     = STATUS_CONFIG[property.status] ?? STATUS_CONFIG.draft
          const Icon       = config.icon
          const units      = property.unit_types ?? []
          const totalUnits = units.reduce((a: number, u: any) => a + u.total_count, 0)
          const landlord   = property.profiles
          const isSuspended = property.status === 'suspended'
          const isApproved  = property.status === 'approved'

          return (
            <Card key={property.id} className="border-border/60">
              <CardContent className="p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className="text-base font-bold text-foreground truncate">{property.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {property.location}, {property.county}
                        </div>
                      </div>
                      <Badge variant={config.variant} className="flex items-center gap-1.5 shrink-0 text-xs">
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Landlord</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">
                          {landlord?.full_name ?? '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Units</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{totalUnits}</p>
                      </div>
                      {property.total_score > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">Score</p>
                          <p className="text-sm font-bold text-primary mt-0.5 flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {property.total_score}/100
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">
                          {new Date(property.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-4 pt-4 border-t border-border/50 flex-wrap">
                      {isApproved && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs border-destructive/30 text-destructive hover:border-destructive/60">
                              <ShieldAlert className="h-3.5 w-3.5" />
                              Suspend
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Suspend {property.name}?</AlertDialogTitle>
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
                                onClick={() => suspendMutation.mutate({ id: property.id, suspend: true, reason })}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Suspend
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {isSuspended && (
                        <Button
                          size="sm" variant="outline"
                          className="gap-1.5 h-8 text-xs"
                          onClick={() => suspendMutation.mutate({ id: property.id, suspend: false })}
                          disabled={suspendMutation.isPending}
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Unsuspend
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {!isLoading && properties.length === 0 && (
          <Card className="border-dashed border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <Building2 className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No properties found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}