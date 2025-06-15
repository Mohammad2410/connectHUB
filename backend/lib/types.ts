// Type definitions for the application

export interface User {
  id: string
  name: string
  username: string
  email: string
  bio?: string
  avatar?: string | null
  coverImage?: string | null
  followersCount: number
  followingCount: number
  createdAt: string
  updatedAt: string
}

export interface Post {
  id: string
  content: string
  image?: string | null
  user: User
  likesCount: number
  commentsCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  content: string
  user: User
  postId: string
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  type: "like" | "comment" | "follow"
  message: string
  read: boolean
  sender: User
  postId?: string
  createdAt: string
}
