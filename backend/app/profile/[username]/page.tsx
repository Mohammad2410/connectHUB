"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostCard } from "@/components/post-card"
import { getUserProfile, followUser, unfollowUser } from "@/lib/api"
import type { User, Post } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { username } = useParams() as { username: string }
  const [profile, setProfile] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const userJson = localStorage.getItem("user")
    if (userJson) {
      setCurrentUser(JSON.parse(userJson))
    }

    const loadProfile = async () => {
      try {
        const data = await getUserProfile(username)
        setProfile(data.user)
        setPosts(data.posts)
        setIsFollowing(data.isFollowing)
      } catch (error) {
        toast({
          title: "Error loading profile",
          description: "Could not load this user's profile. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [username, router, toast])

  const handleFollowToggle = async () => {
    if (!profile) return

    try {
      if (isFollowing) {
        await unfollowUser(profile.id)
        setIsFollowing(false)
        toast({
          title: `Unfollowed ${profile.username}`,
        })
      } else {
        await followUser(profile.id)
        setIsFollowing(true)
        toast({
          title: `Following ${profile.username}`,
        })
      }
    } catch (error) {
      toast({
        title: "Action failed",
        description: "Could not update follow status. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4">
          <div className="h-40 bg-slate-100 animate-pulse rounded-lg mb-6"></div>
          <div className="h-64 bg-slate-100 animate-pulse rounded-lg"></div>
        </div>
      </Layout>
    )
  }

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4 text-center py-20">
          <h1 className="text-2xl font-bold">User not found</h1>
          <p className="text-slate-500 mt-2">The user you're looking for doesn't exist</p>
          <Button className="mt-4" onClick={() => router.push("/feed")}>
            Back to Feed
          </Button>
        </div>
      </Layout>
    )
  }

  const isOwnProfile = currentUser?.id === profile.id

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="h-40 bg-gradient-to-r from-slate-300 to-slate-400 relative">
            {profile.coverImage && (
              <Image src={profile.coverImage || "/placeholder.svg"} alt="Cover" fill className="object-cover" />
            )}
          </div>
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center">
            <div className="relative -mt-16 sm:-mt-20 mb-4 sm:mb-0">
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                {profile.avatar ? (
                  <Image
                    src={profile.avatar || "/placeholder.svg"}
                    alt={profile.name}
                    width={128}
                    height={128}
                    className="object-cover h-full w-full"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-slate-300 text-2xl font-bold text-white">
                    {profile.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 sm:ml-6">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-slate-500">@{profile.username}</p>
              {profile.bio && <p className="mt-2">{profile.bio}</p>}
              <div className="flex items-center mt-2 space-x-4">
                <span className="text-sm">
                  <span className="font-bold">{profile.followersCount}</span> followers
                </span>
                <span className="text-sm">
                  <span className="font-bold">{profile.followingCount}</span> following
                </span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              {isOwnProfile ? (
                <Button variant="outline" onClick={() => router.push("/profile/edit")}>
                  Edit Profile
                </Button>
              ) : (
                <Button variant={isFollowing ? "outline" : "default"} onClick={handleFollowToggle}>
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Tabs defaultValue="posts">
            <TabsList className="w-full">
              <TabsTrigger value="posts" className="flex-1">
                Posts
              </TabsTrigger>
              <TabsTrigger value="media" className="flex-1">
                Media
              </TabsTrigger>
              <TabsTrigger value="likes" className="flex-1">
                Likes
              </TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="mt-6">
              {posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium">No posts yet</h3>
                  <p className="text-slate-500 mt-1">
                    {isOwnProfile ? "You haven't" : "This user hasn't"} posted anything yet
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="media" className="mt-6">
              <div className="grid grid-cols-3 gap-2">
                {posts
                  .filter((post) => post.image)
                  .map((post) => (
                    <div key={post.id} className="aspect-square bg-slate-100 rounded overflow-hidden">
                      <Image
                        src={post.image || "/placeholder.svg?height=300&width=300"}
                        alt="Post media"
                        width={300}
                        height={300}
                        className="object-cover h-full w-full"
                      />
                    </div>
                  ))}
              </div>
              {posts.filter((post) => post.image).length === 0 && (
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium">No media yet</h3>
                  <p className="text-slate-500 mt-1">
                    {isOwnProfile ? "You haven't" : "This user hasn't"} posted any media yet
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="likes" className="mt-6">
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">Coming soon</h3>
                <p className="text-slate-500 mt-1">This feature is not available yet</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  )
}
