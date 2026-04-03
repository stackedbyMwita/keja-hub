export interface Profile {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  full_name: string
  avatar_url: string
  phone_number: string | null
  created_at: string
  updated_at: string
}

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
  is_deleted: boolean
  parent_post_id: string | null
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'>
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'>
}

export interface Like {
  post_id: string
  user_id: string
  created_at: string
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}

export interface SavedPost {
  post_id: string
  user_id: string
  created_at: string
}