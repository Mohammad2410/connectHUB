const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const User = require("../models/User")
const Post = require("../models/Post")
const Comment = require("../models/Comment")

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/social_media")
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Post.deleteMany({})
    await Comment.deleteMany({})
    console.log("Cleared existing data")

    // Create sample users
    const users = await User.create([
      {
        username: "johndoe",
        email: "john@example.com",
        name: "John Doe",
        bio: "Software developer and tech enthusiast",
        password: "password123",
      },
      {
        username: "janesmith",
        email: "jane@example.com",
        name: "Jane Smith",
        bio: "Digital artist and designer",
        password: "password123",
      },
      {
        username: "bobwilson",
        email: "bob@example.com",
        name: "Bob Wilson",
        bio: "Photographer and traveler",
        password: "password123",
      },
    ])

    console.log("Created sample users")

    // Create sample posts
    const posts = await Post.create([
      {
        content: "Just finished working on a new project! #coding #webdev",
        user: users[0]._id,
      },
      {
        content: "Check out my latest design work!",
        user: users[1]._id,
      },
      {
        content: "Beautiful sunset from my latest trip 🌅",
        user: users[2]._id,
      },
      {
        content: "Learning new technologies every day. The journey never ends!",
        user: users[0]._id,
      },
    ])

    console.log("Created sample posts")

    // Create sample comments
    await Comment.create([
      {
        content: "Great work! Looking forward to seeing more.",
        user: users[1]._id,
        post: posts[0]._id,
      },
      {
        content: "Amazing design as always!",
        user: users[0]._id,
        post: posts[1]._id,
      },
      {
        content: "Wow, that's breathtaking!",
        user: users[1]._id,
        post: posts[2]._id,
      },
    ])

    console.log("Created sample comments")

    // Add some follows
    users[0].following.push(users[1]._id, users[2]._id)
    users[1].followers.push(users[0]._id)
    users[2].followers.push(users[0]._id)

    users[1].following.push(users[2]._id)
    users[2].followers.push(users[1]._id)

    await Promise.all(users.map((user) => user.save()))

    console.log("Database seeded successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Seeding error:", error)
    process.exit(1)
  }
}

seedDatabase()
