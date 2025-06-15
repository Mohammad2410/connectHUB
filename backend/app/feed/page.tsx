"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout"
import { PostCard } from "@/components/post-card"
import { CreatePostForm } from "@/components/create-post-form"
import { getFeed } from "@/lib/api"
import type { Post } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const loadFeed = async () => {
      try {
        const feedPosts = await getFeed()
        setPosts(feedPosts)
      } catch (error) {
        toast({
          title: "Error loading feed",
          description: "Could not load your feed. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadFeed()
  }, [router, toast])

  const handleNewPost = (newPost: Post) => {
    setPosts((prevPosts) => [newPost, ...prevPosts])
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto w-full p-4 space-y-6">
        <CreatePostForm onPostCreated={handleNewPost} />

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium">No posts yet</h3>
            <p className="text-slate-500 mt-1">Follow some users to see their posts in your feed</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
