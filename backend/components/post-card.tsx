"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import type { Post } from "@/lib/types"
import { likePost, unlikePost, deletePost } from "@/lib/api"

interface PostCardProps {
  post: Post
  expanded?: boolean
}

export function PostCard({ post, expanded = false }: PostCardProps) {
  const [currentPost, setCurrentPost] = useState<Post>(post)
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post.likesCount)
  const { toast } = useToast()

  const handleLikeToggle = async () => {
    try {
      if (isLiked) {
        await unlikePost(post.id)
        setIsLiked(false)
        setLikesCount((prev) => prev - 1)
      } else {
        await likePost(post.id)
        setIsLiked(true)
        setLikesCount((prev) => prev + 1)
      }
    } catch (error) {
      toast({
        title: "Action failed",
        description: "Could not update like status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deletePost(post.id)
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      })
      // Refresh the page or update the UI as needed
      window.location.href = "/feed"
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Could not delete the post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const isCurrentUserPost = () => {
    const userJson = localStorage.getItem("user")
    if (!userJson) return false

    const currentUser = JSON.parse(userJson)
    return currentUser.id === post.user.id
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <Link href={`/profile/${post.user.username}`} className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden">
              {post.user.avatar ? (
                <Image
                  src={post.user.avatar || "/placeholder.svg"}
                  alt={post.user.name}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-300 text-white font-bold">
                  {post.user.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <div className="font-medium">{post.user.name}</div>
              <div className="text-sm text-slate-500">
                @{post.user.username} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </div>
            </div>
          </Link>

          {isCurrentUserPost() && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className={`mt-3 ${expanded ? "" : "line-clamp-4"}`}>
          <p>{post.content}</p>
        </div>

        {post.image && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <Image
              src={post.image || "/placeholder.svg"}
              alt="Post image"
              width={600}
              height={400}
              className="w-full object-cover"
              style={{ maxHeight: "400px" }}
            />
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLikeToggle}
              className="flex items-center space-x-1 text-slate-500 hover:text-red-500"
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              <span>{likesCount}</span>
            </button>

            <Link href={`/post/${post.id}`} className="flex items-center space-x-1 text-slate-500 hover:text-slate-900">
              <MessageCircle className="h-5 w-5" />
              <span>{post.commentsCount}</span>
            </Link>

            <button className="flex items-center space-x-1 text-slate-500 hover:text-slate-900">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {!expanded && (
        <Link
          href={`/post/${post.id}`}
          className="block px-4 py-2 bg-slate-50 text-center text-sm text-slate-500 hover:bg-slate-100"
        >
          View all {post.commentsCount} comments
        </Link>
      )}
    </div>
  )
}
