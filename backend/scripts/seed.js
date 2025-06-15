const { sequelize, User, Post, Comment, Follow, Like } = require("../models")
require("dotenv").config()

async function seedDatabase() {
  try {
    // Sync database
    await sequelize.sync({ force: true })
    console.log("Database synchronized")

    // Create sample users
    const users = await User.bulkCreate([
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
    const posts = await Post.bulkCreate([
      {
        content: "Just finished working on a new project! #coding #webdev",
        userId: users[0].id,
      },
      {
        content: "Check out my latest design work!",
        userId: users[1].id,
      },
      {
        content: "Beautiful sunset from my latest trip 🌅",
        userId: users[2].id,
      },
      {
        content: "Learning new technologies every day. The journey never ends!",
        userId: users[0].id,
      },
    ])

    console.log("Created sample posts")

    // Create sample comments
    await Comment.bulkCreate([
      {
        content: "Great work! Looking forward to seeing more.",
        userId: users[1].id,
        postId: posts[0].id,
      },
      {
        content: "Amazing design as always!",
        userId: users[0].id,
        postId: posts[1].id,
      },
      {
        content: "Wow, that's breathtaking!",
        userId: users[1].id,
        postId: posts[2].id,
      },
    ])

    console.log("Created sample comments")

    // Create sample follows
    await Follow.bulkCreate([
      {
        followerId: users[0].id,
        followingId: users[1].id,
      },
      {
        followerId: users[0].id,
        followingId: users[2].id,
      },
      {
        followerId: users[1].id,
        followingId: users[2].id,
      },
    ])

    console.log("Created sample follows")

    // Create sample likes
    await Like.bulkCreate([
      {
        userId: users[1].id,
        postId: posts[0].id,
      },
      {
        userId: users[2].id,
        postId: posts[0].id,
      },
      {
        userId: users[0].id,
        postId: posts[1].id,
      },
    ])

    console.log("Created sample likes")

    console.log("Database seeded successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Seeding error:", error)
    process.exit(1)
  }
}

seedDatabase()
