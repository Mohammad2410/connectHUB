"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Heart, UserPlus, MessageCircle } from "lucide-react"
import { markNotificationAsRead } from "@/lib/api"
import type { Notification } from "@/lib/types"

interface NotificationItemProps {
  notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const [isRead, setIsRead] = useState(notification.read)

  const handleClick = async () => {
    if (!isRead) {
      try {
        await markNotificationAsRead(notification.id)
        setIsRead(true)
      } catch (error) {
        console.error("Failed to mark notification as read", error)
      }
    }
  }

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />
      case "follow":
        return <UserPlus className="h-5 w-5 text-blue-500" />
      case "comment":
        return <MessageCircle className="h-5 w-5 text-green-500" />
      default:
        return <Heart className="h-5 w-5 text-slate-500" />
    }
  }

  const getNotificationLink = () => {
    switch (notification.type) {
      case "like":
      case "comment":
        return `/post/${notification.postId}`
      case "follow":
        return `/profile/${notification.sender.username}`
      default:
        return "#"
    }
  }

  return (
    <Link href={getNotificationLink()}>
      <div
        className={`flex items-center space-x-3 p-3 rounded-lg ${
          isRead ? "bg-white" : "bg-blue-50"
        } hover:bg-slate-100 transition-colors`}
        onClick={handleClick}
      >
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden">
            {notification.sender.avatar ? (
              <Image
                src={notification.sender.avatar || "/placeholder.svg"}
                alt={notification.sender.name}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-300 text-white font-bold">
                {notification.sender.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium">{notification.sender.name}</span>
            <span className="text-sm text-slate-500">@{notification.sender.username}</span>
          </div>
          <p className="text-sm">{notification.message}</p>
          <div className="text-xs text-slate-500 mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </div>
        </div>

        <div className="flex-shrink-0">{getNotificationIcon()}</div>
      </div>
    </Link>
  )
}
