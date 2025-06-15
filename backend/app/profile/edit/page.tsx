"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { updateProfile, uploadImage } from "@/lib/api"
import type { User } from "@/lib/types"

export default function EditProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
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
      const userData = JSON.parse(userJson)
      setUser(userData)
      setFormData({
        name: userData.name || "",
        username: userData.username || "",
        email: userData.email || "",
        bio: userData.bio || "",
      })
      setAvatarPreview(userData.avatar || null)
      setCoverPreview(userData.coverImage || null)
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let avatarUrl = user?.avatar
      let coverUrl = user?.coverImage

      if (avatarFile) {
        const avatarData = await uploadImage(avatarFile)
        avatarUrl = avatarData.url
      }

      if (coverFile) {
        const coverData = await uploadImage(coverFile)
        coverUrl = coverData.url
      }

      const updatedUser = await updateProfile({
        ...formData,
        avatar: avatarUrl,
        coverImage: coverUrl,
      })

      // Update local storage with new user data
      localStorage.setItem("user", JSON.stringify(updatedUser))

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      router.push(`/profile/${updatedUser.username}`)
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4">
          <div className="h-40 bg-slate-100 animate-pulse rounded-lg mb-6"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Profile Picture</Label>
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="h-24 w-24 rounded-full bg-slate-200 overflow-hidden">
                      {avatarPreview ? (
                        <Image
                          src={avatarPreview || "/placeholder.svg"}
                          alt="Avatar preview"
                          width={96}
                          height={96}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-slate-300 text-2xl font-bold text-white">
                          {user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <Input type="file" accept="image/*" onChange={handleAvatarChange} className="max-w-xs" />
                  </div>
                </div>

                <div>
                  <Label>Cover Photo</Label>
                  <div className="mt-2">
                    <div className="h-40 bg-slate-200 rounded-lg overflow-hidden mb-2">
                      {coverPreview && (
                        <Image
                          src={coverPreview || "/placeholder.svg"}
                          alt="Cover preview"
                          width={800}
                          height={200}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <Input type="file" accept="image/*" onChange={handleCoverChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about yourself"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push(`/profile/${user.username}`)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  )
}
