"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Layout } from "@/components/layout"
import { PostCard } from "@/components/post-card"
import { CommentForm } from "@/components/comment-form"
import { CommentList } from "@/components/comment-list"
import { getPost, getComments } from "@/lib/api"
import type { Post, Comment } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

export default function PostPage() {
  const { id } = useParams() as { id: string }
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const loadPost = async () => {
      try {
        const postData = await getPost(id)
        setPost(postData)

        const commentsData = await getComments(id)
        setComments(commentsData)
      } catch (error) {
        toast({
          title: "Error loading post",
          description: "Could not load this post. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPost()
  }, [id, router, toast])

  const handleNewComment = (newComment: Comment) => {
    setComments((prevComments) => [newComment, ...prevComments])
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-4">
          <div className="h-64 bg-slate-100 animate-pulse rounded-lg mb-6"></div>
          <div className="h-32 bg-slate-100 animate-pulse rounded-lg"></div>
        </div>
      </Layout>
    )
  }

  if (!post) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-4 text-center py-20">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <p className="text-slate-500 mt-2">The post you're looking for doesn't exist</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <PostCard post={post} expanded />

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Comments ({comments.length})</h2>
          <CommentForm postId={post.id} onCommentAdded={handleNewComment} />
          <div className="mt-6">
            <CommentList comments={comments} />
          </div>
        </div>
      </div>
    </Layout>
  )
}
