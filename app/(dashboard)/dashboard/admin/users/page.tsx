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
import { Users, Search, Loader2, Ban, CheckCircle2 } from 'lucide-react'
import { useDebounce } from 'use-debounce'

async function fetchUsers(search: string) {
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  const res    = await fetch(`/api/admin/users${params}`)
  if (!res.ok) throw new Error('Failed to fetch')
  return (await res.json()).data
}

export default function AdminUsersPage() {
  const queryClient         = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch]   = useDebounce(search, 400)
  const [reason, setReason] = useState('')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', debouncedSearch],
    queryFn:  () => fetchUsers(debouncedSearch),
  })

  const banMutation = useMutation({
    mutationFn: async ({ id, ban, reason }: { id: string; ban: boolean; reason?: string }) => {
      const res = await fetch(`/api/admin/users/${id}/ban`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ban, reason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
    },
    onSuccess: (_, { ban }) => {
      toast.success(ban ? 'User banned' : 'User unbanned')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setReason('')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-8 max-w-5xl mx-auto">

      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} users shown</p>
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

      <div className="flex flex-col gap-3">
        {users.map((user: any) => (
          <Card key={user.id} className="border-border/60">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center gap-4">
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="bg-muted text-foreground font-semibold text-sm">
                    {user.full_name?.charAt(0) ?? 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{user.full_name ?? 'No name'}</p>
                      <p className="text-xs text-muted-foreground">{user.email} · {user.phone_number ?? 'No phone'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {user.is_banned && <Badge variant="destructive" className="text-xs">Banned</Badge>}
                      {!user.is_active && !user.is_banned && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                      <Badge variant="outline" className="text-xs capitalize">
                        {user.onboarding_status === 'complete' ? 'Onboarded' : 'Pending setup'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {user.heard_from && (
                      <p className="text-xs text-muted-foreground truncate">via {user.heard_from}</p>
                    )}
                  </div>
                </div>

                {/* Ban / Unban */}
                {user.is_banned ? (
                  <Button
                    size="sm" variant="outline"
                    className="gap-1.5 h-8 text-xs shrink-0"
                    onClick={() => banMutation.mutate({ id: user.id, ban: false })}
                    disabled={banMutation.isPending}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Unban
                  </Button>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs shrink-0 border-destructive/30 text-destructive hover:border-destructive/60">
                        <Ban className="h-3.5 w-3.5" />
                        Ban
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Ban {user.full_name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This user will be immediately redirected to /banned and cannot access the platform.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex flex-col gap-1.5 py-2">
                        <Label className="text-xs font-medium">Reason (optional)</Label>
                        <Textarea
                          value={reason}
                          onChange={e => setReason(e.target.value)}
                          placeholder="Reason for ban..."
                          className="resize-none h-20 text-sm"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => banMutation.mutate({ id: user.id, ban: true, reason })}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Ban user
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {!isLoading && users.length === 0 && (
          <Card className="border-dashed border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <Users className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No users found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}