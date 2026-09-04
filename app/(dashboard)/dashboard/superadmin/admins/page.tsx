'use client'

import { UserAvatar } from '@/components/Components/UserAvatar'
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatKenyaPhone, timeAgo } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDownCircle, CheckCircle2, Crown, Loader2, UserPlus, XCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

async function fetchAdmins() {
  const res = await fetch('/api/superadmin/admins')
  if (!res.ok) throw new Error('Failed to fetch')
  return (await res.json()).data
}

export default function SuperadminAdminsPage() {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['superadmin-admins'],
    queryFn: fetchAdmins,
  })

  const promoteMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch('/api/superadmin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data
    },
    onSuccess: () => {
      toast.success('User promoted to admin')
      queryClient.invalidateQueries({ queryKey: ['superadmin-admins'] })
      setEmail('')
      setInviteOpen(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, is_active }: { id: string; action: string; is_active?: boolean }) => {
      const res = await fetch(`/api/superadmin/admins/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, is_active }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
    },
    onSuccess: (_, { action }) => {
      const messages: Record<string, string> = {
        demote: 'Admin demoted to user',
        toggle_active: 'Admin status updated',
      }
      toast.success(messages[action] ?? 'Done')
      queryClient.invalidateQueries({ queryKey: ['superadmin-admins'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <DashboardPageWrapper>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-5 w-5 text-amber-500" />
            <h1 className="text-2xl font-heading font-bold text-foreground">Admins</h1>
          </div>
          <p className="text-sm text-muted-foreground">{admins.length} platform administrator{admins.length !== 1 ? 's' : ''}</p>
        </div>

        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Promote to admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Promote user to admin</DialogTitle>
              <DialogDescription>Enter the email of an existing KéjaLink user to promote them to admin.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">Email address</Label>
                <Input
                  type="email"
                  placeholder="user@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={promoteMutation.isPending}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setInviteOpen(false)}>Cancel</Button>
                <Button
                  className="flex-1"
                  onClick={() => promoteMutation.mutate(email.trim())}
                  disabled={!email.trim() || promoteMutation.isPending}
                >
                  {promoteMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Promoting...</> : 'Promote to admin'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      <div className="flex flex-col gap-4">
        {admins.map((admin: any) => (
          <Card key={admin.id} className="border-border/60">
            <CardContent className="p-5 md:p-6">
              <div className="flex items-start gap-4">
                <UserAvatar
                  name={admin.full_name}
                  imageUrl={admin.avatar_url}
                  userId={admin.id}
                  size="md"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-base font-bold text-foreground">{admin.full_name ?? 'No name'}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                      <p className="text-sm text-muted-foreground">{formatKenyaPhone(admin.phone_number)}</p>
                    </div>
                    <Badge variant={admin.is_active ? 'default' : 'secondary'} className="shrink-0">
                      {admin.is_active ? 'Active' : 'Deactivated'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total actions</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">{admin.total_actions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last active</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">{timeAgo(admin.last_active)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Joined</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">
                        {new Date(admin.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4 pt-4 border-t border-border/50 flex-wrap">

                    {/* Toggle active */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" disabled={actionMutation.isPending}>
                          {admin.is_active
                            ? <><XCircle className="h-3.5 w-3.5 text-destructive" />Deactivate</>
                            : <><CheckCircle2 className="h-3.5 w-3.5 text-green-600" />Reactivate</>
                          }
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{admin.is_active ? 'Deactivate' : 'Reactivate'} {admin.full_name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {admin.is_active ? 'This admin will lose dashboard access immediately.' : 'This admin will regain dashboard access.'}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => actionMutation.mutate({ id: admin.id, action: 'toggle_active', is_active: !admin.is_active })}>
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* Demote */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs border-destructive/30 text-destructive hover:border-destructive/60" disabled={actionMutation.isPending}>
                          <ArrowDownCircle className="h-3.5 w-3.5" />
                          Demote to user
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Demote {admin.full_name} to user?</AlertDialogTitle>
                          <AlertDialogDescription>
                            They will lose all admin privileges immediately and be downgraded to a regular user account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => actionMutation.mutate({ id: admin.id, action: 'demote' })}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Demote
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

        {!isLoading && admins.length === 0 && (
          <Card className="border-dashed border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <Crown className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No admins yet</p>
              <p className="text-xs text-muted-foreground">Promote users to admin using the button above.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardPageWrapper>
  )
}