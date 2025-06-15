// API service to interact with the backend at localhost:8000

// Helper function to handle API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token")

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`http://localhost:8000${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || error.detail || "An error occurred")
  }

  return response.json()
}

// Auth API
export async function loginUser(credentials: { email: string; password: string }) {
  return apiRequest("/auth/login/", {
    method: "POST",
    body: JSON.stringify(credentials),
  })
}

export async function registerUser(userData: {
  name: string
  username: string
  email: string
  password: string
}) {
  return apiRequest("/auth/register/", {
    method: "POST",
    body: JSON.stringify(userData),
  })
}

// User API
export async function getUserProfile(username: string) {
  return apiRequest(`/users/${username}/`)
}

export async function updateProfile(userData: {
  name: string
  username: string
  email: string
  bio?: string
  avatar?: string | null
  coverImage?: string | null
}) {
  return apiRequest("/users/profile/", {
    method: "PUT",
    body: JSON.stringify(userData),
  })
}

export async function followUser(userId: string) {
  return apiRequest(`/users/${userId}/follow/`, {
    method: "POST",
  })
}

export async function unfollowUser(userId: string) {
  return apiRequest(`/users/${userId}/unfollow/`, {
    method: "POST",
  })
}

// Post API
export async function getFeed() {
  return apiRequest("/posts/feed/")
}

export async function getPost(postId: string) {
  return apiRequest(`/posts/${postId}/`)
}

export async function createPost(postData: {
  content: string
  image?: string | null
}) {
  return apiRequest("/posts/", {
    method: "POST",
    body: JSON.stringify(postData),
  })
}

export async function deletePost(postId: string) {
  return apiRequest(`/posts/${postId}/`, {
    method: "DELETE",
  })
}

export async function likePost(postId: string) {
  return apiRequest(`/posts/${postId}/like/`, {
    method: "POST",
  })
}

export async function unlikePost(postId: string) {
  return apiRequest(`/posts/${postId}/unlike/`, {
    method: "POST",
  })
}

// Comment API
export async function getComments(postId: string) {
  return apiRequest(`/posts/${postId}/comments/`)
}

export async function createComment(postId: string, commentData: { content: string }) {
  return apiRequest(`/posts/${postId}/comments/`, {
    method: "POST",
    body: JSON.stringify(commentData),
  })
}

export async function deleteComment(commentId: string) {
  return apiRequest(`/comments/${commentId}/`, {
    method: "DELETE",
  })
}

// Notification API
export async function getNotifications() {
  return apiRequest("/notifications/")
}

export async function getUnreadNotificationsCount() {
  const response = await apiRequest("/notifications/unread/count/")
  return response.count || 0
}

export async function markNotificationAsRead(notificationId: string) {
  return apiRequest(`/notifications/${notificationId}/read/`, {
    method: "POST",
  })
}

export async function markAllNotificationsAsRead() {
  return apiRequest("/notifications/read-all/", {
    method: "POST",
  })
}

// Search API
export async function searchUsers(query: string) {
  return apiRequest(`/users/search/?q=${encodeURIComponent(query)}`)
}

export async function searchPosts(query: string) {
  return apiRequest(`/posts/search/?q=${encodeURIComponent(query)}`)
}

// Upload API
export async function uploadImage(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const token = localStorage.getItem("token")

  const response = await fetch("http://localhost:8000/upload/", {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || error.detail || "Failed to upload image")
  }

  return response.json()
}

// Helper function to check if user is authenticated
export function isAuthenticated(): boolean {
  return !!localStorage.getItem("token")
}

// Helper function to get current user from localStorage
export function getCurrentUser() {
  const userJson = localStorage.getItem("user")
  if (!userJson) return null
  try {
    return JSON.parse(userJson)
  } catch {
    return null
  }
}

// Helper function to logout user
export function logoutUser() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

// Helper function to refresh token
export async function refreshToken() {
  const refreshToken = localStorage.getItem("refresh")
  if (!refreshToken) {
    throw new Error("No refresh token available")
  }

  const response = await fetch("http://localhost:8000/auth/token/refresh/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh: refreshToken,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to refresh token")
  }

  const data = await response.json()
  localStorage.setItem("token", data.access)
  return data.access
}
