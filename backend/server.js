const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

// Import database
const { sequelize } = require("./models")

const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const postRoutes = require("./routes/posts")
const commentRoutes = require("./routes/comments")
const notificationRoutes = require("./routes/notifications")
const uploadRoutes = require("./routes/upload")

const app = express()

// Security middleware
app.use(helmet())
app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000","http://localhost:3002","http://127.0.0.1:3002"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Test database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to PostgreSQL database")
    // Sync database in development
    if (process.env.NODE_ENV === "development") {
      return sequelize.sync({ alter: true })
    }
  })
  .then(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Database synchronized")
    }
  })
  .catch((err) => console.error("Database connection error:", err))

// Routes
app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/posts", postRoutes)
app.use("/comments", commentRoutes)
app.use("/notifications", notificationRoutes)
app.use("/upload", uploadRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app
