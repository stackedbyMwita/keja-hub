import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchPosts, fetchUserPosts, fetchPost, fetchPostComments,
  fetchCurrentUserProfile, createPost, updatePost, deletePost,
  createComment, deleteComment, likePost, unlikePost, checkIfLiked,
  repostPost, savePost, unsavePost, checkIfSaved,
} from '@/lib/api/posts'
import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/supabase/client'

export function usePosts() {
  const supabase = useSupabaseClient()
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => fetchPosts(supabase),
  })
}

export function useUserPosts(userId?: string) {
  const supabase = useSupabaseClient()
  return useQuery({
    queryKey: ['posts', 'user', userId],
    queryFn: () => fetchUserPosts(supabase, userId!),
    enabled: !!userId,
  })
}

export function usePost(id: string) {
  const supabase = useSupabaseClient()
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => fetchPost(supabase, id),
    enabled: !!id,
  })
}

export function usePostComments(postId: string) {
  const supabase = useSupabaseClient()
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => fetchPostComments(supabase, postId),
    enabled: !!postId,
  })
}

export function useCurrentUserProfile() {
  const { user } = useUser()
  const supabase = useSupabaseClient()
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchCurrentUserProfile(supabase, user!.id),
    enabled: !!user,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  const { user } = useUser()
  const supabase = useSupabaseClient()
  return useMutation({
    mutationFn: (content: string) => createPost(supabase, content, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()
  const supabase = useSupabaseClient()
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      updatePost(supabase, id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()
  const supabase = useSupabaseClient()
  return useMutation({
    mutationFn: (id: string) => deletePost(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient()
  const { user } = useUser()
  const supabase = useSupabaseClient()
  return useMutation({
    mutationFn: (content: string) => createComment(supabase, postId, user!.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient()
  const supabase = useSupabaseClient()
  return useMutation({
    mutationFn: (id: string) => deleteComment(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useLikePost(postId: string) {
  const queryClient = useQueryClient()
  const { user } = useUser()
  const supabase = useSupabaseClient()

  const { data: isLiked } = useQuery({
    queryKey: ['like', postId, user?.id],
    queryFn: () => checkIfLiked(supabase, postId, user!.id),
    enabled: !!user,
  })

  const likeMutation = useMutation({
    mutationFn: () => likePost(supabase, postId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.setQueryData(['like', postId, user?.id], true)
    },
  })

  const unlikeMutation = useMutation({
    mutationFn: () => unlikePost(supabase, postId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.setQueryData(['like', postId, user?.id], false)
    },
  })

  return {
    isLiked: isLiked ?? false,
    toggleLike: () => isLiked ? unlikeMutation.mutate() : likeMutation.mutate(),
    isLiking: likeMutation.isPending || unlikeMutation.isPending,
  }
}

export function useSavePost(postId: string) {
  const queryClient = useQueryClient()
  const { user } = useUser()
  const supabase = useSupabaseClient()

  const { data: isSaved } = useQuery({
    queryKey: ['saved', postId, user?.id],
    queryFn: () => checkIfSaved(supabase, postId, user!.id),
    enabled: !!user,
  })

  const saveMutation = useMutation({
    mutationFn: () => savePost(supabase, postId, user!.id),
    onSuccess: () => queryClient.setQueryData(['saved', postId, user?.id], true),
  })

  const unsaveMutation = useMutation({
    mutationFn: () => unsavePost(supabase, postId, user!.id),
    onSuccess: () => queryClient.setQueryData(['saved', postId, user?.id], false),
  })

  return {
    isSaved: isSaved ?? false,
    toggleSave: () => isSaved ? unsaveMutation.mutate() : saveMutation.mutate(),
    isSaving: saveMutation.isPending || unsaveMutation.isPending,
  }
}

export function useRepostPost() {
  const queryClient = useQueryClient()
  const { user } = useUser()
  const supabase = useSupabaseClient()
  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content?: string }) =>
      repostPost(supabase, postId, user!.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}