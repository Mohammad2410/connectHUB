const express = require("express")
const { body, validationResult } = require("express-validator")
const { Op } = require("sequelize")
const { User, Post, Follow, Like, Notification } = require("../models")
const auth = require("../middleware/auth")

const router = express.Router()

// Get user profile
router.get("/:username", auth, async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Get user's posts with likes and comments count
    const posts = await Post.findAll({
      where: { userId: user.id, isDeleted: false },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "name", "avatar"],
        },
        {
          model: User,
          as: "likedBy",
          attributes: ["id", "username"],
          through: { attributes: [] },
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 20,
    })

    // Get follower/following counts
    const followersCount = await user.countFollowers()
    const followingCount = await user.countFollowing()

    // Check if current user is following this user
    const isFollowing = await Follow.findOne({
      where: {
        followerId: req.user.id,
        followingId: user.id,
      },
    })

    // Add isLiked field to posts and count comments
    const postsWithLikeStatus = await Promise.all(
      posts.map(async (post) => {
        const commentsCount = await post.countComments()
        const isLiked = post.likedBy.some((likedUser) => likedUser.id === req.user.id)

        return {
          id: post.id,
          content: post.content,
          image: post.image,
          user: post.user,
          likesCount: post.likedBy.length,
          commentsCount,
          isLiked,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        }
      }),
    )

    res.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar,
        coverImage: user.coverImage,
        followersCount,
        followingCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      posts: postsWithLikeStatus,
      isFollowing: !!isFollowing,
    })
  } catch (error) {
    console.error("Get user profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update profile
router.put(
  "/profile",
  auth,
  [
    body("name").optional().isLength({ min: 1, max: 100 }).trim(),
    body("username").optional().isLength({ min: 3, max: 30 }).trim().isAlphanumeric(),
    body("email").optional().isEmail().normalizeEmail(),
    body("bio").optional().isLength({ max: 500 }).trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { name, username, email, bio, avatar, coverImage } = req.body
      const updateData = {}

      if (name) updateData.name = name
      if (username) updateData.username = username
      if (email) updateData.email = email
      if (bio !== undefined) updateData.bio = bio
      if (avatar !== undefined) updateData.avatar = avatar
      if (coverImage !== undefined) updateData.coverImage = coverImage

      // Check if username or email already exists (if being updated)
      if (username || email) {
        const whereConditions = []
        if (username) whereConditions.push({ username })
        if (email) whereConditions.push({ email })

        const existingUser = await User.findOne({
          where: {
            [Op.and]: [{ id: { [Op.ne]: req.user.id } }, { [Op.or]: whereConditions }],
          },
        })

        if (existingUser) {
          return res.status(400).json({
            message: existingUser.username === username ? "Username already taken" : "Email already registered",
          })
        }
      }

      await req.user.update(updateData)

      // Get updated counts
      const followersCount = await req.user.countFollowers()
      const followingCount = await req.user.countFollowing()

      res.json({
        message: "Profile updated successfully",
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          name: req.user.name,
          bio: req.user.bio,
          avatar: req.user.avatar,
          coverImage: req.user.coverImage,
          followers_count: followersCount,
          following_count: followingCount,
          created_at: req.user.createdAt,
          updated_at: req.user.updatedAt,
        },
      })
    } catch (error) {
      console.error("Update profile error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Follow user
router.post("/:userId/follow", auth, async (req, res) => {
  try {
    const userToFollow = await User.findByPk(req.params.userId)

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" })
    }

    if (req.params.userId === req.user.id) {
      return res.status(400).json({ message: "Cannot follow yourself" })
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId,
      },
    })

    if (existingFollow) {
      return res.status(400).json({ message: "Already following this user" })
    }

    // Create follow relationship
    await Follow.create({
      followerId: req.user.id,
      followingId: req.params.userId,
    })

    // Create notification
    await Notification.create({
      recipientId: req.params.userId,
      senderId: req.user.id,
      type: "follow",
      message: `${req.user.name} started following you`,
    })

    res.json({ message: "User followed successfully" })
  } catch (error) {
    console.error("Follow user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Unfollow user
router.post("/:userId/unfollow", auth, async (req, res) => {
  try {
    const userToUnfollow = await User.findByPk(req.params.userId)

    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if following
    const existingFollow = await Follow.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId,
      },
    })

    if (!existingFollow) {
      return res.status(400).json({ message: "Not following this user" })
    }

    // Remove follow relationship
    await existingFollow.destroy()

    res.json({ message: "User unfollowed successfully" })
  } catch (error) {
    console.error("Unfollow user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Search users
router.get("/search", auth, async (req, res) => {
  try {
    const { q } = req.query

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: "Search query must be at least 2 characters" })
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [{ username: { [Op.iLike]: `%${q}%` } }, { name: { [Op.iLike]: `%${q}%` } }],
      },
      attributes: ["id", "username", "name", "bio", "avatar"],
      limit: 20,
    })

    // Add follower/following counts
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const followersCount = await user.countFollowers()
        const followingCount = await user.countFollowing()

        return {
          ...user.toJSON(),
          followersCount,
          followingCount,
        }
      }),
    )

    res.json(usersWithCounts)
  } catch (error) {
    console.error("Search users error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
