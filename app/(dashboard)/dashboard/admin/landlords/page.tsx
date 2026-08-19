'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Building2, MapPin, Search, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react'

async function fetchLandlords() {
  const res = await fetch('/api/admin/landlords')
  if (!res.ok) throw new Error('Failed to fetch')
  return (await res.json()).data
}

export default function AdminLandlordsPage() {
  const queryClient         = useQueryClient()
  const [search, setSearch] = useState('')
  const [reason, setReason] = useState('')

  const { data: landlords = [], isLoading } = useQuery({
    queryKey: ['admin-landlords'],
    queryFn:  fetchLandlords,
  })

  const suspendMutation = useMutation({
    mutationFn: async ({ id, suspend, reason }: { id: string; suspend: boolean; reason?: string }) => {
      const res = await fetch(`/api/admin/landlords/${id}/suspend`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ suspend, reason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
    },
    onSuccess: (_, { suspend }) => {
      toast.success(suspend ? 'Landlord suspended' : 'Landlord unsuspended')
      queryClient.invalidateQueries({ queryKey: ['admin-landlords'] })
      setReason('')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const filtered = landlords.filter((l: any) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      l.full_name?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.phone_number?.includes(q)
    )
  })

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-8 max-w-5xl mx-auto">

      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Landlords</h1>
          <p className="text-sm text-muted-foreground mt-1">{landlords.length} registered landlords</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      <div className="flex flex-col gap-4">
        {filtered.map((landlord: any) => {
          const app     = landlord.landlord_profiles?.[0]
          const counts  = landlord.property_counts ?? {}
          const active  = landlord.is_active

          return (
            <Card key={landlord.id} className="border-border/60">
              <CardContent className="p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-11 h-11 shrink-0">
                    <AvatarImage src={landlord.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {landlord.full_name?.charAt(0) ?? 'L'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-base font-bold text-foreground">{landlord.full_name}</p>
                        <p className="text-sm text-muted-foreground">{landlord.email}</p>
                        <p className="text-xs text-muted-foreground">{landlord.phone_number}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={active ? 'default' : 'destructive'}>
                          {active ? 'Active' : 'Suspended'}
                        </Badge>
                        {app && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {app.status}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {app && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                        <MapPin className="h-3 w-3" />
                        {app.location}, {app.county}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {[
                        { label: 'Total properties', value: counts.total    ?? 0 },
                        { label: 'Approved',          value: counts.approved ?? 0 },
                        { label: 'Pending',           value: counts.pending  ?? 0 },
                      ].map(stat => (
                        <div key={stat.label}>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                          <p className="text-sm font-bold text-foreground mt-0.5">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 mt-4 pt-4 border-t border-border/50">
                      {active ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs border-destructive/30 text-destructive hover:border-destructive/60">
                              <ShieldAlert className="h-3.5 w-3.5" />
                              Suspend landlord
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Suspend {landlord.full_name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                All their approved properties will be hidden from listings immediately.
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
                                onClick={() => suspendMutation.mutate({ id: landlord.id, suspend: true, reason })}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Suspend
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Button
                          size="sm" variant="outline"
                          className="gap-1.5 h-8 text-xs"
                          onClick={() => suspendMutation.mutate({ id: landlord.id, suspend: false })}
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

        {!isLoading && filtered.length === 0 && (
          <Card className="border-dashed border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <Building2 className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No landlords found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}