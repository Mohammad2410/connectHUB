const express = require("express")
const { Notification, User, Post } = require("../models")
const auth = require("../middleware/auth")

const router = express.Router()

// Get notifications
router.get("/", auth, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit

    const notifications = await Notification.findAll({
      where: { recipientId: req.user.id },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "name", "avatar"],
        },
        {
          model: Post,
          as: "post",
          attributes: ["id", "content"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit,
    })

    res.json(notifications)
  } catch (error) {
    console.error("Get notifications error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get unread notifications count
router.get("/unread/count", auth, async (req, res) => {
  try {
    const count = await Notification.count({
      where: {
        recipientId: req.user.id,
        read: false,
      },
    })

    res.json({ count })
  } catch (error) {
    console.error("Get unread count error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Mark notification as read
router.post("/:notificationId/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.notificationId,
        recipientId: req.user.id,
      },
    })

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    await notification.update({ read: true })

    res.json({ message: "Notification marked as read" })
  } catch (error) {
    console.error("Mark notification read error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Mark all notifications as read
router.post("/read-all", auth, async (req, res) => {
  try {
    await Notification.update({ read: true }, { where: { recipientId: req.user.id, read: false } })

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("Mark all notifications read error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
