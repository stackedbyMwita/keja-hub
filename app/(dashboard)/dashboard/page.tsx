'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import MaxWidthWrapper from '@/components/layout/MaxWidthWrapper'
import { PostCard } from '@/components/posts/PostCard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCreatePost, useCurrentUserProfile, usePosts, useUserPosts } from '@/hooks/usePosts'
import { Loader2 } from 'lucide-react'

function CreatePostBox() {
  const { user } = useUser()
  const { data: profile } = useCurrentUserProfile()
  const createPost = useCreatePost()
  const [content, setContent] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    await createPost.mutateAsync(content)
    setContent('')
  }

  if (!user) return null

  return (
    <div className="border border-border rounded-lg bg-card p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <Avatar className="w-9 h-9 shrink-0">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>{profile?.full_name?.[0]}</AvatarFallback>
          </Avatar>
          <Textarea
            placeholder="What's happening?"
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={createPost.isPending}
            className="resize-none bg-transparent border-0 focus-visible:ring-0 p-0 text-sm placeholder:text-muted-foreground"
            rows={3}
          />
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className={`text-xs ${content.length > 260 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {content.length}/280
          </span>
          <Button
            type="submit"
            size="sm"
            disabled={createPost.isPending || !content.trim() || content.length > 280}
          >
            {createPost.isPending ? <><Loader2 size={13} className="mr-1 animate-spin" /> Posting...</> : 'Post'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function Feed() {
  const { data: posts, isLoading, error } = usePosts()

  if (isLoading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="animate-spin text-muted-foreground" />
    </div>
  )

  if (error) return (
    <div className="text-center py-12">
      <p className="text-sm text-destructive">{error.message}</p>
      <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="mt-3">
        Retry
      </Button>
    </div>
  )

  if (!posts?.length) return (
    <div className="text-center py-16 border border-dashed border-border rounded-lg">
      <p className="text-sm text-muted-foreground">No posts yet. Be the first!</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {posts.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  )
}

function MyPosts() {
  const { user } = useUser()
  const { data: posts, isLoading } = useUserPosts(user?.id)

  if (isLoading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="animate-spin text-muted-foreground" />
    </div>
  )

  if (!posts?.length) return (
    <div className="text-center py-16 border border-dashed border-border rounded-lg">
      <p className="text-sm text-muted-foreground">You haven't posted anything yet.</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {posts.map(post => (
        <PostCard key={post.id} post={post} showActions />
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const { data: profile } = useCurrentUserProfile()

  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <MaxWidthWrapper className="max-w-2xl">
        <div className="py-8 space-y-6">

          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {profile?.full_name || user?.fullName || 'there'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Share what's on your mind
            </p>
          </div>

          <CreatePostBox />

          <Tabs defaultValue="feed">
            <TabsList className="w-full">
              <TabsTrigger value="feed" className="flex-1">Feed</TabsTrigger>
              <TabsTrigger value="my-posts" className="flex-1">My Posts</TabsTrigger>
            </TabsList>
            <TabsContent value="feed" className="mt-4">
              <Feed />
            </TabsContent>
            <TabsContent value="my-posts" className="mt-4">
              <MyPosts />
            </TabsContent>
          </Tabs>

        </div>
      </MaxWidthWrapper>
    </div>
  )
}