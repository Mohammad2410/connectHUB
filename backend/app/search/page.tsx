"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { SearchIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { User, Post } from "@/lib/types"
import { UserCard } from "@/components/user-card"
import { PostCard } from "@/components/post-card"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("users")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) {
      toast({
        title: "Please enter a search term",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // In a real app, these would be API calls to your backend
      // For now, we'll simulate the search results

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock search results
      if (activeTab === "users") {
        setUsers([
          {
            id: "1",
            name: "John Doe",
            username: "johndoe",
            email: "john@example.com",
            bio: "Software developer and tech enthusiast",
            avatar: "/placeholder.svg?height=100&width=100",
            followersCount: 120,
            followingCount: 45,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "2",
            name: "Jane Smith",
            username: "janesmith",
            email: "jane@example.com",
            bio: "Digital artist and designer",
            avatar: "/placeholder.svg?height=100&width=100",
            followersCount: 250,
            followingCount: 78,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ])
        setPosts([])
      } else {
        setPosts([
          {
            id: "1",
            content: "Just finished working on a new project! #coding #webdev",
            user: {
              id: "1",
              name: "John Doe",
              username: "johndoe",
              email: "john@example.com",
              followersCount: 120,
              followingCount: 45,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            likesCount: 15,
            commentsCount: 3,
            isLiked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "2",
            content: "Check out my latest design work!",
            image: "/placeholder.svg?height=400&width=600",
            user: {
              id: "2",
              name: "Jane Smith",
              username: "janesmith",
              email: "jane@example.com",
              followersCount: 250,
              followingCount: 78,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            likesCount: 42,
            commentsCount: 7,
            isLiked: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ])
        setUsers([])
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Could not complete your search. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <form onSubmit={handleSearch}>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for users or posts..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>

          <div className="mt-4">
            <Tabs defaultValue="users" onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="users" className="flex-1">
                  Users
                </TabsTrigger>
                <TabsTrigger value="posts" className="flex-1">
                  Posts
                </TabsTrigger>
              </TabsList>
              <TabsContent value="users" className="mt-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                ) : query ? (
                  <div className="text-center py-10">
                    <p className="text-slate-500">No users found matching "{query}"</p>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-slate-500">Search for users to see results</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="posts" className="mt-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : query ? (
                  <div className="text-center py-10">
                    <p className="text-slate-500">No posts found matching "{query}"</p>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-slate-500">Search for posts to see results</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  )
}
