const express = require("express")
const { body, validationResult } = require("express-validator")
const { Comment, Post, User, Notification } = require("../models")
const auth = require("../middleware/auth")

const router = express.Router()

// Get comments for a post
router.get("/posts/:postId/comments", auth, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit

    const comments = await Comment.findAll({
      where: {
        postId: req.params.postId,
        isDeleted: false,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "name", "avatar"],
        },
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit,
    })

    res.json(comments)
  } catch (error) {
    console.error("Get comments error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create comment
router.post(
  "/posts/:postId/comments",
  auth,
  [body("content").isLength({ min: 1, max: 1000 }).trim()],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const post = await Post.findOne({
        where: {
          id: req.params.postId,
          isDeleted: false,
        },
      })

      if (!post) {
        return res.status(404).json({ message: "Post not found" })
      }

      const comment = await Comment.create({
        content: req.body.content,
        userId: req.user.id,
        postId: req.params.postId,
      })

      // Load comment with user data
      const commentWithUser = await Comment.findByPk(comment.id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username", "name", "avatar"],
          },
        ],
      })

      // Create notification (if not own post)
      if (post.userId !== req.user.id) {
        await Notification.create({
          recipientId: post.userId,
          senderId: req.user.id,
          type: "comment",
          message: `${req.user.name} commented on your post`,
          postId: post.id,
        })
      }

      res.status(201).json(commentWithUser)
    } catch (error) {
      console.error("Create comment error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete comment
router.delete("/:commentId", auth, async (req, res) => {
  try {
    const comment = await Comment.findOne({
      where: {
        id: req.params.commentId,
        userId: req.user.id,
        isDeleted: false,
      },
    })

    if (!comment) {
      return res.status(404).json({ message: "Comment not found or unauthorized" })
    }

    await comment.update({ isDeleted: true })

    res.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Delete comment error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
