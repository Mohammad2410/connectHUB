"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { ImageIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createPost, uploadImage } from "@/lib/api"
import type { Post, User } from "@/lib/types"

interface CreatePostFormProps {
  onPostCreated: (post: Post) => void
}

export function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() && !imageFile) {
      toast({
        title: "Cannot create empty post",
        description: "Please add some text or an image to your post.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      let imageUrl = null

      if (imageFile) {
        const imageData = await uploadImage(imageFile)
        imageUrl = imageData.url
      }

      const newPost = await createPost({
        content,
        image: imageUrl,
      })

      toast({
        title: "Post created",
        description: "Your post has been published successfully.",
      })

      setContent("")
      setImageFile(null)
      setImagePreview(null)

      onPostCreated(newPost)
    } catch (error) {
      toast({
        title: "Post failed",
        description: "There was an error creating your post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get current user from localStorage
  const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem("user")
    if (!userJson) return null
    return JSON.parse(userJson)
  }

  const currentUser = getCurrentUser()

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
            {currentUser?.avatar ? (
              <Image
                src={currentUser.avatar || "/placeholder.svg"}
                alt={currentUser.name}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-300 text-white font-bold">
                {currentUser?.name.charAt(0) || "U"}
              </div>
            )}
          </div>
          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-0"
            />

            {imagePreview && (
              <div className="relative mt-3 rounded-lg overflow-hidden">
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="Post preview"
                  width={600}
                  height={400}
                  className="w-full object-cover"
                  style={{ maxHeight: "300px" }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Add Image
                </Button>
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
