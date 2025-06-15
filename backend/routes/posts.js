const express = require("express")
const { body, validationResult } = require("express-validator")
const { Op } = require("sequelize")
const { Post, User, Comment, Like, Notification, Follow } = require("../models")
const auth = require("../middleware/auth")

const router = express.Router()

// Get feed
router.get("/feed", auth, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    // Get following user IDs
    const following = await Follow.findAll({
      where: { followerId: req.user.id },
      attributes: ["followingId"],
    })

    const followingIds = following.map((f) => f.followingId)
    followingIds.push(req.user.id) // Include own posts

    const posts = await Post.findAll({
      where: {
        userId: { [Op.in]: followingIds },
        isDeleted: false,
      },
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
      offset,
      limit,
    })

    // Add isLiked field and comments count
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

    res.json(postsWithLikeStatus)
  } catch (error) {
    console.error("Get feed error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get single post
router.get("/:postId", auth, async (req, res) => {
  try {
    const post = await Post.findOne({
      where: {
        id: req.params.postId,
        isDeleted: false,
      },
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
    })

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    const commentsCount = await post.countComments()
    const isLiked = post.likedBy.some((likedUser) => likedUser.id === req.user.id)

    const postWithLikeStatus = {
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

    res.json(postWithLikeStatus)
  } catch (error) {
    console.error("Get post error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create post
router.post("/", auth, [body("content").isLength({ min: 1, max: 2000 }).trim()], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { content, image } = req.body

    const post = await Post.create({
      content,
      image: image || null,
      userId: req.user.id,
    })

    // Load the post with user data
    const postWithUser = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "name", "avatar"],
        },
      ],
    })

    res.status(201).json({
      id: postWithUser.id,
      content: postWithUser.content,
      image: postWithUser.image,
      user: postWithUser.user,
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      createdAt: postWithUser.createdAt,
      updatedAt: postWithUser.updatedAt,
    })
  } catch (error) {
    console.error("Create post error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete post
router.delete("/:postId", auth, async (req, res) => {
  try {
    const post = await Post.findOne({
      where: {
        id: req.params.postId,
        userId: req.user.id,
        isDeleted: false,
      },
    })

    if (!post) {
      return res.status(404).json({ message: "Post not found or unauthorized" })
    }

    await post.update({ isDeleted: true })

    // Soft delete associated comments
    await Comment.update({ isDeleted: true }, { where: { postId: req.params.postId } })

    res.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Delete post error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Like post
router.post("/:postId/like", auth, async (req, res) => {
  try {
    const post = await Post.findOne({
      where: {
        id: req.params.postId,
        isDeleted: false,
      },
    })

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    // Check if already liked
    const existingLike = await Like.findOne({
      where: {
        userId: req.user.id,
        postId: req.params.postId,
      },
    })

    if (existingLike) {
      return res.status(400).json({ message: "Post already liked" })
    }

    // Create like
    await Like.create({
      userId: req.user.id,
      postId: req.params.postId,
    })

    // Create notification (if not own post)
    if (post.userId !== req.user.id) {
      await Notification.create({
        recipientId: post.userId,
        senderId: req.user.id,
        type: "like",
        message: `${req.user.name} liked your post`,
        postId: post.id,
      })
    }

    res.json({ message: "Post liked successfully" })
  } catch (error) {
    console.error("Like post error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Unlike post
router.post("/:postId/unlike", auth, async (req, res) => {
  try {
    const post = await Post.findOne({
      where: {
        id: req.params.postId,
        isDeleted: false,
      },
    })

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    // Check if liked
    const existingLike = await Like.findOne({
      where: {
        userId: req.user.id,
        postId: req.params.postId,
      },
    })

    if (!existingLike) {
      return res.status(400).json({ message: "Post not liked" })
    }

    // Remove like
    await existingLike.destroy()

    res.json({ message: "Post unliked successfully" })
  } catch (error) {
    console.error("Unlike post error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Search posts
router.get("/search", auth, async (req, res) => {
  try {
    const { q } = req.query

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: "Search query must be at least 2 characters" })
    }

    const posts = await Post.findAll({
      where: {
        content: { [Op.iLike]: `%${q}%` },
        isDeleted: false,
      },
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

    // Add isLiked field and comments count
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

    res.json(postsWithLikeStatus)
  } catch (error) {
    console.error("Search posts error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
