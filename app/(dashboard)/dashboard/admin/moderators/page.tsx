'use client'

import { UserAvatar } from '@/components/Components/UserAvatar'
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { timeAgo } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ActivitySquare,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldCheck, UserPlus,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

async function fetchModerators() {
  const res = await fetch('/api/admin/moderators')
  if (!res.ok) throw new Error('Failed to fetch moderators')
  return (await res.json()).data
}

export default function AdminModeratorsPage() {
  const queryClient = useQueryClient()
  const [inviteEmail, setEmail] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)

  const { data: moderators = [], isLoading } = useQuery({
    queryKey: ['admin-moderators'],
    queryFn:  fetchModerators,
  })

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch('/api/admin/moderators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data
    },
    onSuccess: () => {
      toast.success('User promoted to moderator successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-moderators'] })
      setEmail('')
      setInviteOpen(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const res = await fetch(`/api/admin/moderators/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
    },
    onSuccess: () => {
      toast.success('Moderator status updated')
      queryClient.invalidateQueries({ queryKey: ['admin-moderators'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <DashboardPageWrapper>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-5">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Moderators</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {moderators.length} moderator{moderators.length !== 1 ? 's' : ''} in the system
          </p>
        </div>

        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add moderator
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Promote user to moderator</DialogTitle>
              <DialogDescription>
                Enter the email of an existing KéjaLink user to promote them to moderator.
                They must have already signed up.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">Email address</Label>
                <Input
                  type="email"
                  placeholder="user@email.com"
                  value={inviteEmail}
                  onChange={e => setEmail(e.target.value)}
                  disabled={inviteMutation.isPending}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => inviteMutation.mutate(inviteEmail.trim())}
                  disabled={!inviteEmail.trim() || inviteMutation.isPending}
                >
                  {inviteMutation.isPending
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Promoting...</>
                    : 'Promote to moderator'
                  }
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Moderator cards */}
      <div className="flex flex-col gap-4">
        {moderators.map((mod: any) => (
          <Card key={mod.id} className="border-border/60">
            <CardContent className="p-5 md:p-6">
              <div className="flex items-start gap-4">
                <UserAvatar
                  name={mod.full_name}
                  imageUrl={mod.avatar_url}
                  userId={mod.id}
                  size="md"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-base font-bold text-foreground">{mod.full_name ?? 'No name'}</p>
                      <p className="text-sm text-muted-foreground">{mod.email}</p>
                    </div>
                    <Badge variant={mod.is_active ? 'default' : 'secondary'} className="shrink-0">
                      {mod.is_active ? 'Active' : 'Deactivated'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    {[
                      { label: 'Total reviews', value: mod.total_reviews, icon: ShieldCheck },
                      { label: 'This month',    value: mod.month_reviews,  icon: ActivitySquare },
                      { label: 'Phone',         value: mod.phone_number ?? '—', icon: null },
                      { label: 'Last active',   value: timeAgo(mod.last_active), icon: null },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                 

                  <div className="flex gap-3 mt-4 pt-4 border-t border-border/50 flex-wrap">
                    <Button asChild size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                      <Link href={`/dashboard/admin/moderators/${mod.id}`}>
                        View details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm" variant="outline"
                          className={`gap-1.5 h-8 text-xs ${mod.is_active ? 'border-destructive/30 text-destructive hover:border-destructive/60 hover:bg-destructive/5' : ''}`}
                          disabled={toggleMutation.isPending}
                        >
                          {mod.is_active
                            ? <><XCircle className="h-3.5 w-3.5" />Deactivate</>
                            : <><CheckCircle2 className="h-3.5 w-3.5" />Reactivate</>
                          }
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {mod.is_active ? 'Deactivate' : 'Reactivate'} {mod.full_name}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {mod.is_active
                              ? 'This moderator will lose access to their dashboard immediately.'
                              : 'This moderator will regain access to their dashboard.'
                            }
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => toggleMutation.mutate({ id: mod.id, is_active: !mod.is_active })}
                            className={mod.is_active ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                          >
                            {mod.is_active ? 'Deactivate' : 'Reactivate'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!isLoading && moderators.length === 0 && (
          <Card className="border-dashed border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <ShieldCheck className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No moderators yet</p>
              <p className="text-xs text-muted-foreground">Add your first moderator using the button above.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardPageWrapper>
  )
}