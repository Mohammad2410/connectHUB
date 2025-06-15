"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Bell, Home, Search, User, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import type { User as UserType } from "@/lib/types"
import { getUnreadNotificationsCount } from "@/lib/api"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const userJson = localStorage.getItem("user")
    if (userJson) {
      setUser(JSON.parse(userJson))
    }

    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationsCount()
        setUnreadCount(count)
      } catch (error) {
        console.error("Failed to fetch unread notifications count", error)
      }
    }

    fetchUnreadCount()

    // Set up polling for notifications
    const interval = setInterval(fetchUnreadCount, 30000) // every 30 seconds

    return () => clearInterval(interval)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const navItems = [
    { href: "/feed", icon: <Home className="h-5 w-5" />, label: "Home" },
    { href: "/search", icon: <Search className="h-5 w-5" />, label: "Search" },
    {
      href: "/notifications",
      icon: (
        <div className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </div>
      ),
      label: "Notifications",
    },
    {
      href: user ? `/profile/${user.username}` : "/profile",
      icon: <User className="h-5 w-5" />,
      label: "Profile",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-white border-b lg:hidden">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/feed" className="flex items-center font-bold text-xl">
            ConnectHub
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between py-4 border-b">
                  <span className="font-bold text-xl">ConnectHub</span>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetTrigger>
                </div>

                {user && (
                  <div className="py-4 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden">
                        {user.avatar ? (
                          <Image
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.name}
                            width={40}
                            height={40}
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
                      </div>
                    </div>
                  </div>
                )}

                <nav className="flex flex-col space-y-1 py-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md ${
                        pathname === item.href
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </nav>

                <div className="mt-auto py-4 border-t">
                  <div className="text-sm text-slate-500 text-center">&copy; {new Date().getFullYear()} ConnectHub</div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <Link href="/feed" className="flex items-center font-bold text-xl">
                ConnectHub
              </Link>
            </div>

            {user && (
              <div className="p-4 border-b">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden">
                    {user.avatar ? (
                      <Image
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                        width={40}
                        height={40}
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
                  </div>
                </div>
              </div>
            )}

            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md ${
                    pathname === item.href
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </nav>

            <div className="p-4 border-t">
              <div className="text-sm text-slate-500 text-center">&copy; {new Date().getFullYear()} ConnectHub</div>
            </div>
          </div>
        </aside>

        <main className="ml-64 flex-1">{children}</main>
      </div>

      {/* Mobile Content */}
      <main className="lg:hidden pb-16">{children}</main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t lg:hidden">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center h-full w-full ${
                pathname === item.href ? "text-slate-900" : "text-slate-600"
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
