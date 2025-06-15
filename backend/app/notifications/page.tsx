"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout"
import { NotificationItem } from "@/components/notification-item"
import { getNotifications, markAllNotificationsAsRead } from "@/lib/api"
import type { Notification } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const loadNotifications = async () => {
      try {
        const notificationsData = await getNotifications()
        setNotifications(notificationsData)
      } catch (error) {
        toast({
          title: "Error loading notifications",
          description: "Could not load your notifications. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [router, toast])

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          read: true,
        })),
      )
      toast({
        title: "All notifications marked as read",
      })
    } catch (error) {
      toast({
        title: "Action failed",
        description: "Could not mark notifications as read. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {notifications.some((n) => !n.read) && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium">No notifications</h3>
            <p className="text-slate-500 mt-1">You don't have any notifications yet</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
