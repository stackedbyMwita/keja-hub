// app/(landing)/page.tsx
'use client'

import MaxWidthWrapper from "@/components/layout/MaxWidthWrapper";
import { useCreatePost, useCurrentUserProfile, usePosts } from '@/hooks/usePosts';
import { useUser } from '@clerk/nextjs';
import { Eye, Heart, MessageSquare, Recycle } from "lucide-react";
import { useState } from 'react';

const ICON_SIZE = 18

export default function Home() {
  const { user, isLoaded: userLoaded } = useUser()
  const [newPostContent, setNewPostContent] = useState('')
  
  // TanStack Query hooks
  const { data: posts, isLoading: postsLoading, error: postsError } = usePosts()
  const { data: profile, isLoading: profileLoading } = useCurrentUserProfile()
  const createPostMutation = useCreatePost()
  
  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newPostContent.trim()) return
    
    await createPostMutation.mutateAsync(newPostContent)
    setNewPostContent('') // Clear input
  }
  
  // Show loading state
  if (!userLoaded || postsLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Show error state
  if (postsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Error loading posts: {postsError.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      <MaxWidthWrapper>
        <div className="py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Welcome back, {profile?.full_name || user?.fullName || 'User'}! 👋
            </h1>
            <p className="text-muted-foreground mt-2">
              Share what's on your mind...
            </p>
          </div>
          
          {/* Create Post Form */}
          <div className="mb-8 p-6 border rounded-lg bg-card">
            <form onSubmit={handleCreatePost}>
              <textarea
                className="w-full p-3 border rounded-md bg-background resize-none"
                rows={3}
                placeholder="What's happening?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                disabled={createPostMutation.isPending}
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={createPostMutation.isPending || !newPostContent.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createPostMutation.isPending ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Posts Feed */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
            
            {posts && posts.length === 0 && (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
              </div>
            )}
            
            {posts && posts.map((post) => (
              <div key={post.id} className="p-4 border rounded-lg bg-card">
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <img
                    src={post.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`}
                    alt={post.profiles?.username}
                    className="w-10 h-10 rounded-full"
                  />
                  
                  {/* Post Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{post.profiles?.full_name}</span>
                      <span className="text-sm text-muted-foreground">@{post.profiles?.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2">{post.content}</p>
                    
                    {/* Post Stats */}
                    <div className="flex items-center space-x-6 mt-3 text-sm text-muted-foreground">
                      <button className="hover:text-primary flex items-center gap-2 transition-colors">
                        <Heart size={ICON_SIZE} /> {post.like_count} Likes
                      </button>
                      <button className="hover:text-primary flex items-center gap-2 transition-colors">
                        <MessageSquare size={ICON_SIZE} /> {post.comment_count} Comments
                      </button>
                      <button className="hover:text-primary flex items-center gap-2 transition-colors">
                        <Recycle size={ICON_SIZE} /> {post.repost_count} Reposts
                      </button>
                      <span className=" flex items-center gap-2 "><Eye size={ICON_SIZE} /> {post.view_count} Views</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}