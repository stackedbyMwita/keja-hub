'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Heart, MessageSquare, Repeat2, Eye,
  Bookmark, MoreHorizontal, Trash2, Pencil, X, Check
} from 'lucide-react'
import { Post, Comment } from '@/types'
import {
  useLikePost, useSavePost, useRepostPost,
  usePostComments, useCreateComment,
  useDeleteComment, useUpdatePost, useDeletePost
} from '@/hooks/usePosts'
import { formatDistanceToNow } from 'date-fns'

const ICON_SIZE = 15

function CommentItem({ comment, currentUserId, postId }: {
  comment: Comment
  currentUserId?: string
  postId: string
}) {
  const deleteComment = useDeleteComment(postId)
  const isOwner = currentUserId === comment.user_id

  return (
    <div className="flex items-start gap-2.5 py-3 border-b border-border last:border-0">
      <Avatar className="w-7 h-7 shrink-0">
        <AvatarImage src={comment.profiles?.avatar_url} />
        <AvatarFallback className="text-xs">{comment.profiles?.full_name?.[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium">{comment.profiles?.full_name}</span>
          <span className="text-xs text-muted-foreground">@{comment.profiles?.username}</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm mt-0.5 leading-relaxed">{comment.content}</p>
      </div>
      {isOwner && (
        <button
          onClick={() => deleteComment.mutate(comment.id)}
          className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  )
}

function CommentsSection({ postId, currentUserId }: {
  postId: string
  currentUserId?: string
}) {
  const { data: comments, isLoading } = usePostComments(postId)
  const createComment = useCreateComment(postId)
  const [content, setContent] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    await createComment.mutateAsync(content)
    setContent('')
  }

  return (
    <div className="mt-3 pt-3 border-t border-border">
      {currentUserId && (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
          <Textarea
            placeholder="Write a comment..."
            value={content}
            onChange={e => setContent(e.target.value)}
            className="resize-none text-sm min-h-0 h-9 py-2"
            rows={1}
          />
          <Button
            type="submit"
            size="sm"
            disabled={createComment.isPending || !content.trim()}
            className="shrink-0"
          >
            {createComment.isPending ? '...' : 'Reply'}
          </Button>
        </form>
      )}
      {isLoading && <p className="text-xs text-muted-foreground">Loading comments...</p>}
      {comments?.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          postId={postId}
        />
      ))}
      {!isLoading && comments?.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">No comments yet</p>
      )}
    </div>
  )
}

interface PostCardProps {
  post: Post
  showActions?: boolean  // owner actions (edit/delete)
}

export function PostCard({ post, showActions = false }: PostCardProps) {
  const { user } = useUser()
  const { isLiked, toggleLike, isLiking } = useLikePost(post.id)
  const { isSaved, toggleSave } = useSavePost(post.id)
  const repost = useRepostPost()
  const updatePost = useUpdatePost()
  const deletePost = useDeletePost()

  const [showComments, setShowComments] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)

  const isOwner = user?.id === post.user_id

  const handleUpdate = async () => {
    if (!editContent.trim() || editContent === post.content) {
      setIsEditing(false)
      return
    }
    await updatePost.mutateAsync({ id: post.id, content: editContent })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    await deletePost.mutateAsync(post.id)
  }

  return (
    <div className="p-4 border border-border rounded-lg bg-card hover:bg-muted/10 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar className="w-9 h-9 shrink-0">
          <AvatarImage src={post.profiles?.avatar_url} />
          <AvatarFallback>{post.profiles?.full_name?.[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="text-sm font-medium truncate">{post.profiles?.full_name}</span>
              <span className="text-xs text-muted-foreground">@{post.profiles?.username}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>

            {/* owner actions */}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                    <MoreHorizontal size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setIsEditing(true); setEditContent(post.content) }}>
                    <Pencil size={13} className="mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 size={13} className="mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* content */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="text-sm resize-none"
                rows={3}
                maxLength={280}
              />
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs text-muted-foreground">{editContent.length}/280</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                >
                  <X size={13} className="mr-1" /> Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={updatePost.isPending}
                >
                  <Check size={13} className="mr-1" />
                  {updatePost.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1.5 text-sm leading-relaxed">{post.content}</p>
          )}

          {/* actions */}
          <div className="flex items-center gap-5 mt-3 text-xs text-muted-foreground">
            <button
              onClick={toggleLike}
              disabled={!user || isLiking}
              className={`flex items-center gap-1.5 transition-colors hover:text-rose-500 ${isLiked ? 'text-rose-500' : ''}`}
            >
              <Heart size={ICON_SIZE} className={isLiked ? 'fill-current' : ''} />
              {post.like_count}
            </button>

            <button
              onClick={() => setShowComments(v => !v)}
              className={`flex items-center gap-1.5 transition-colors hover:text-primary ${showComments ? 'text-primary' : ''}`}
            >
              <MessageSquare size={ICON_SIZE} />
              {post.comment_count}
            </button>

            <button
              onClick={() => user && repost.mutate({ postId: post.id })}
              disabled={!user || repost.isPending}
              className="flex items-center gap-1.5 transition-colors hover:text-green-500"
            >
              <Repeat2 size={ICON_SIZE} />
              {post.repost_count}
            </button>

            <button
              onClick={toggleSave}
              disabled={!user}
              className={`flex items-center gap-1.5 transition-colors hover:text-primary ${isSaved ? 'text-primary' : ''}`}
            >
              <Bookmark size={ICON_SIZE} className={isSaved ? 'fill-current' : ''} />
            </button>

            <span className="flex items-center gap-1.5 ml-auto">
              <Eye size={ICON_SIZE} />
              {post.view_count}
            </span>
          </div>

          {/* comments */}
          {showComments && (
            <CommentsSection postId={post.id} currentUserId={user?.id} />
          )}
        </div>
      </div>
    </div>
  )
}