"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createComment } from "@/lib/api"
import type { Comment, User } from "@/lib/types"

interface CommentFormProps {
  postId: string
  onCommentAdded: (comment: Comment) => void
}

export function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Get current user from localStorage
  const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem("user")
    if (!userJson) return null
    return JSON.parse(userJson)
  }

  const currentUser = getCurrentUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast({
        title: "Cannot post empty comment",
        description: "Please add some text to your comment.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const newComment = await createComment(postId, { content })

      toast({
        title: "Comment added",
      })

      setContent("")
      onCommentAdded(newComment)
    } catch (error) {
      toast({
        title: "Comment failed",
        description: "There was an error posting your comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex space-x-3">
        <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
          {currentUser?.avatar ? (
            <Image
              src={currentUser.avatar || "/placeholder.svg"}
              alt={currentUser.name}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-slate-300 text-white font-bold">
              {currentUser?.name.charAt(0) || "U"}
            </div>
          )}
        </div>
        <div className="flex-1">
          <Textarea
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[60px] resize-none"
          />
          <div className="flex justify-end mt-2">
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
