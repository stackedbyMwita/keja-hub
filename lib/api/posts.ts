// lib/api/posts.ts
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface Post {
  id: string
  user_id: string
  content: string
  media_urls: string[]
  media_types: string[]
  like_count: number
  comment_count: number
  repost_count: number
  view_count: number
  created_at: string
  profiles?: {
    username: string
    full_name: string
    avatar_url: string
  }
}

export interface Profile {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url: string
  phone_number: string | null
  created_at: string
}

// Fetch all posts with user profiles
export async function fetchPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('is_deleted', false)
    .is('parent_post_id', null) // Only top-level posts, not replies
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data as Post[]
}

// Fetch a single post
export async function fetchPost(id: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as Post
}

// Fetch posts by user
export async function fetchUserPosts(userId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data as Post[]
}

// Fetch current user's profile
export async function fetchCurrentUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw new Error(error.message)
  return data as Profile
}

// Create a new post
export async function createPost(content: string, userId: string) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      content: content,
      view_count: 0,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Like a post
export async function likePost(postId: string, userId: string) {
  const { error } = await supabase
    .from('likes')
    .insert({
      post_id: postId,
      user_id: userId,
    })

  if (error) throw new Error(error.message)
}

// Unlike a post
export async function unlikePost(postId: string, userId: string) {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

// Check if user liked a post
export async function checkIfLiked(postId: string, userId: string) {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return !!data
}