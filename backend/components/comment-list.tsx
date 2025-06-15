"use client"

import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import type { Comment, User } from "@/lib/types"
import { deleteComment } from "@/lib/api"

interface CommentListProps {
  comments: Comment[]
}

export function CommentList({ comments }: CommentListProps) {
  const { toast } = useToast()

  // Get current user from localStorage
  const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem("user")
    if (!userJson) return null
    return JSON.parse(userJson)
  }

  const currentUser = getCurrentUser()

  const isCurrentUserComment = (comment: Comment) => {
    if (!currentUser) return false
    return currentUser.id === comment.user.id
  }

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId)
      toast({
        title: "Comment deleted",
      })
      // In a real app, you would update the comments list here
      window.location.reload()
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Could not delete the comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-slate-500">No comments yet. Be the first to comment!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex space-x-3">
          <Link href={`/profile/${comment.user.username}`} className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden">
              {comment.user.avatar ? (
                <Image
                  src={comment.user.avatar || "/placeholder.svg"}
                  alt={comment.user.name}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-300 text-white font-bold">
                  {comment.user.name.charAt(0)}
                </div>
              )}
            </div>
          </Link>
          <div className="flex-1">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <Link href={`/profile/${comment.user.username}`} className="font-medium hover:underline">
                    {comment.user.name}
                  </Link>
                  <span className="text-sm text-slate-500 ml-2">@{comment.user.username}</span>
                </div>

                {isCurrentUserComment(comment) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDelete(comment.id)} className="text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <p className="mt-1">{comment.content}</p>
            </div>
            <div className="text-xs text-slate-500 mt-1 ml-3">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
