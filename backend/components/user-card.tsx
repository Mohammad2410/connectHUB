"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import type { User } from "@/lib/types"
import { followUser, unfollowUser } from "@/lib/api"

interface UserCardProps {
  user: User
  isFollowing?: boolean
}

export function UserCard({ user, isFollowing: initialIsFollowing = false }: UserCardProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFollowToggle = async () => {
    setIsLoading(true)

    try {
      if (isFollowing) {
        await unfollowUser(user.id)
        setIsFollowing(false)
        toast({
          title: `Unfollowed ${user.username}`,
        })
      } else {
        await followUser(user.id)
        setIsFollowing(true)
        toast({
          title: `Following ${user.username}`,
        })
      }
    } catch (error) {
      toast({
        title: "Action failed",
        description: "Could not update follow status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check if this is the current user
  const isCurrentUser = () => {
    const userJson = localStorage.getItem("user")
    if (!userJson) return false

    const currentUser = JSON.parse(userJson)
    return currentUser.id === user.id
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
      <Link href={`/profile/${user.username}`} className="flex items-center space-x-3">
        <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden">
          {user.avatar ? (
            <Image
              src={user.avatar || "/placeholder.svg"}
              alt={user.name}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-slate-300 text-white font-bold">
              {user.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-slate-500">@{user.username}</div>
          {user.bio && <div className="text-sm mt-1 line-clamp-1">{user.bio}</div>}
        </div>
      </Link>

      {!isCurrentUser() && (
        <Button
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          onClick={handleFollowToggle}
          disabled={isLoading}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
      )}
    </div>
  )
}
