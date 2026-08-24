'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ActivitySquare, Loader2 } from 'lucide-react'

const ACTION_LABELS: Record<string, string> = {
  approved_property:             'Approved property',
  rejected_property:             'Rejected property',
  approved_landlord_application: 'Approved landlord',
  rejected_landlord_application: 'Rejected landlord',
  banned_user:                   'Banned user',
  unbanned_user:                 'Unbanned user',
  suspended_landlord:            'Suspended landlord',
  unsuspended_landlord:          'Unsuspended landlord',
  suspended_property:            'Suspended property',
  unsuspended_property:          'Unsuspended property',
  scored_property:               'Scored property',
  uploaded_unit_image:           'Uploaded image',
  promoted_to_moderator:         'Promoted moderator',
  created_property:              'Created property',
  submitted_property_for_review: 'Submitted for review',
}

const ACTION_COLORS: Record<string, string> = {
  approved_property:             'bg-green-500',
  approved_landlord_application: 'bg-green-500',
  promoted_to_moderator:         'bg-blue-500',
  scored_property:               'bg-primary',
  uploaded_unit_image:           'bg-primary',
  created_property:              'bg-primary',
  submitted_property_for_review: 'bg-amber-500',
  rejected_property:             'bg-destructive',
  rejected_landlord_application: 'bg-destructive',
  banned_user:                   'bg-destructive',
  suspended_landlord:            'bg-destructive',
  suspended_property:            'bg-destructive',
}

async function fetchActivity(action: string) {
  const params = action !== 'all' ? `?action=${action}` : ''
  const res    = await fetch(`/api/admin/activity${params}`)
  if (!res.ok) throw new Error('Failed to fetch')
  return (await res.json()).data
}

export default function AdminActivityPage() {
  const [action, setAction] = useState('all')

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-activity', action],
    queryFn:  () => fetchActivity(action),
  })

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-8 max-w-4xl mx-auto">

      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Activity Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">{logs.length} entries</p>
        </div>
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            <SelectItem value="approved_property">Approved property</SelectItem>
            <SelectItem value="rejected_property">Rejected property</SelectItem>
            <SelectItem value="approved_landlord_application">Approved landlord</SelectItem>
            <SelectItem value="rejected_landlord_application">Rejected landlord</SelectItem>
            <SelectItem value="banned_user">Banned user</SelectItem>
            <SelectItem value="suspended_property">Suspended property</SelectItem>
            <SelectItem value="scored_property">Scored property</SelectItem>
            <SelectItem value="uploaded_unit_image">Uploaded image</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ActivitySquare className="h-4 w-4" />
            Platform activity
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {logs.length === 0 && !isLoading ? (
            <p className="text-sm text-muted-foreground px-6 pb-6">No activity found.</p>
          ) : (
            logs.map((log: any, i: number) => {
              const actor    = log.profiles
              const dotColor = ACTION_COLORS[log.action] ?? 'bg-muted-foreground'
              return (
                <div
                  key={log.id}
                  className={`flex items-start gap-4 px-6 py-4 ${i !== logs.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <Avatar className="w-8 h-8 shrink-0 mt-0.5">
                    <AvatarImage src={actor?.avatar_url} />
                    <AvatarFallback className="bg-muted text-xs font-semibold">
                      {actor?.full_name?.charAt(0) ?? '?'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                      <p className="text-sm font-semibold text-foreground">
                        {ACTION_LABELS[log.action] ?? log.action.replace(/_/g, ' ')}
                      </p>
                      {log.metadata?.property_name && (
                        <span className="text-sm text-muted-foreground">— {log.metadata.property_name}</span>
                      )}
                      {log.metadata?.landlord_name && (
                        <span className="text-sm text-muted-foreground">— {log.metadata.landlord_name}</span>
                      )}
                      <Badge variant="outline" className="text-xs capitalize ml-auto shrink-0 rounded-full">
                        {actor?.role ?? 'system'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      by <span className="font-medium text-foreground">{actor?.full_name ?? 'Unknown'}</span>
                      {' · '}
                      {new Date(log.created_at).toLocaleDateString('en-KE', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    {log.metadata?.reason && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Reason: {log.metadata.reason}
                      </p>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}