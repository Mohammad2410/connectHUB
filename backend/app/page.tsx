import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  // Check if user is logged in - in a real app, this would be a server component
  // that checks authentication status
  const isLoggedIn = false

  if (isLoggedIn) {
    redirect("/feed")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">ConnectHub</h1>
          <p className="mt-2 text-slate-600">Connect with friends and the world around you.</p>
        </div>
        <div className="flex flex-col space-y-4">
          <Button asChild className="w-full">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/register">Create New Account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
