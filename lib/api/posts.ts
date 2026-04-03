import { SupabaseClient } from '@supabase/supabase-js'
import { Post, Comment, Profile } from '@/types'

export async function fetchPosts(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('posts')
    .select(`*, profiles!posts_user_id_fkey(id, username, full_name, avatar_url)`)
    .eq('is_deleted', false)
    .is('parent_post_id', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data as Post[]
}

export async function fetchUserPosts(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`*, profiles!posts_user_id_fkey(id, username, full_name, avatar_url)`)
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .is('parent_post_id', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data as Post[]
}

export async function fetchPost(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`*, profiles!posts_user_id_fkey(id, username, full_name, avatar_url)`)
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as Post
}

export async function fetchPostComments(supabase: SupabaseClient, postId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select(`*, profiles!comments_user_id_fkey(id, username, full_name, avatar_url)`)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data as Comment[]
}

export async function fetchCurrentUserProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw new Error(error.message)
  return data as Profile
}

export async function createPost(supabase: SupabaseClient, content: string, userId: string) {
  const { data, error } = await supabase
    .from('posts')
    .insert({ user_id: userId, content, view_count: 0 })
    .select(`*, profiles!posts_user_id_fkey(id, username, full_name, avatar_url)`)
    .single()

  if (error) throw new Error(error.message)
  return data as Post
}

export async function updatePost(supabase: SupabaseClient, id: string, content: string) {
  const { data, error } = await supabase
    .from('posts')
    .update({ content })
    .eq('id', id)
    .select(`*, profiles!posts_user_id_fkey(id, username, full_name, avatar_url)`)
    .single()

  if (error) throw new Error(error.message)
  return data as Post
}

export async function deletePost(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('posts')
    .update({ is_deleted: true })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function createComment(supabase: SupabaseClient, postId: string, userId: string, content: string) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, user_id: userId, content })
    .select(`*, profiles!comments_user_id_fkey(id, username, full_name, avatar_url)`)
    .single()

  if (error) throw new Error(error.message)
  return data as Comment
}

export async function deleteComment(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function likePost(supabase: SupabaseClient, postId: string, userId: string) {
  const { error } = await supabase
    .from('likes')
    .insert({ post_id: postId, user_id: userId })

  if (error) throw new Error(error.message)
}

export async function unlikePost(supabase: SupabaseClient, postId: string, userId: string) {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function checkIfLiked(supabase: SupabaseClient, postId: string, userId: string) {
  const { data, error } = await supabase
    .from('likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return !!data
}

export async function repostPost(supabase: SupabaseClient, postId: string, userId: string, content: string = '') {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      content: content || '🔁 Reposted',
      parent_post_id: postId,
      view_count: 0,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function savePost(supabase: SupabaseClient, postId: string, userId: string) {
  const { error } = await supabase
    .from('saved_posts')
    .insert({ post_id: postId, user_id: userId })

  if (error) throw new Error(error.message)
}

export async function unsavePost(supabase: SupabaseClient, postId: string, userId: string) {
  const { error } = await supabase
    .from('saved_posts')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function checkIfSaved(supabase: SupabaseClient, postId: string, userId: string) {
  const { data, error } = await supabase
    .from('saved_posts')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return !!data
}
