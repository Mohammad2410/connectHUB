const express = require("express")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const { User } = require("../models")
const auth = require("../middleware/auth")

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "24h",
  })
}

// Register
router.post(
  "/register",
  [
    body("username").isLength({ min: 3, max: 30 }).trim().isAlphanumeric(),
    body("email").isEmail().normalizeEmail(),
    body("name").isLength({ min: 1, max: 100 }).trim(),
    body("password").isLength({ min: 6 }),
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

      const { username, email, name, password } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [require("sequelize").Op.or]: [{ email }, { username }],
        },
      })

      if (existingUser) {
        return res.status(400).json({
          message: existingUser.email === email ? "Email already registered" : "Username already taken",
        })
      }

      // Create new user
      const user = await User.create({
        username,
        email,
        name,
        password,
      })

      // Generate token
      const token = generateToken(user.id)

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          bio: user.bio,
          avatar: user.avatar,
          cover_image: user.coverImage,
          followers_count: 0,
          following_count: 0,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        },
        token,
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ message: "Server error during registration" })
    }
  },
)

// Login
router.post("/login", [body("email").isEmail().normalizeEmail(), body("password").exists()], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Get follower/following counts
    const followersCount = await user.countFollowers()
    const followingCount = await user.countFollowing()

    // Generate token
    const token = generateToken(user.id)

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar,
        cover_image: user.coverImage,
        followers_count: followersCount,
        following_count: followingCount,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error during login" })
  }
})

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const followersCount = await req.user.countFollowers()
    const followingCount = await req.user.countFollowing()

    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        name: req.user.name,
        bio: req.user.bio,
        avatar: req.user.avatar,
        cover_image: req.user.coverImage,
        followers_count: followersCount,
        following_count: followingCount,
        created_at: req.user.createdAt,
        updated_at: req.user.updatedAt,
      },
    })
  } catch (error) {
    console.error("Get current user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
