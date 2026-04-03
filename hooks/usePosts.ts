// hooks/usePosts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchPosts, createPost, likePost, unlikePost, checkIfLiked, fetchCurrentUserProfile } from '@/lib/api/posts'
import { useUser } from '@clerk/nextjs'

// Hook for fetching all posts
export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })
}

// Hook for fetching current user profile
export function useCurrentUserProfile() {
  const { user } = useUser()
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchCurrentUserProfile(user!.id),
    enabled: !!user,
  })
}

// Hook for creating a post
export function useCreatePost() {
  const queryClient = useQueryClient()
  const { user } = useUser()
  
  return useMutation({
    mutationFn: (content: string) => createPost(content, user!.id),
    onSuccess: () => {
      // Invalidate and refetch posts after creating a new one
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

// Hook for liking/unliking a post
export function useLikePost(postId: string) {
  const queryClient = useQueryClient()
  const { user } = useUser()
  
  const { data: isLiked } = useQuery({
    queryKey: ['like', postId, user?.id],
    queryFn: () => checkIfLiked(postId, user!.id),
    enabled: !!user,
  })
  
  const likeMutation = useMutation({
    mutationFn: () => likePost(postId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['like', postId, user?.id] })
    },
  })
  
  const unlikeMutation = useMutation({
    mutationFn: () => unlikePost(postId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['like', postId, user?.id] })
    },
  })
  
  const toggleLike = () => {
    if (isLiked) {
      unlikeMutation.mutate()
    } else {
      likeMutation.mutate()
    }
  }
  
  return {
    isLiked,
    toggleLike,
    isLiking: likeMutation.isPending,
    isUnliking: unlikeMutation.isPending,
  }
}