const { Sequelize } = require("sequelize")
const config = require("../config/database")

const env = process.env.NODE_ENV || "development"
const dbConfig = config[env]

let sequelize

if (dbConfig.use_env_variable) {
  // For production, use DATABASE_URL environment variable
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], {
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    ...(dbConfig.dialectOptions && { dialectOptions: dbConfig.dialectOptions }),
  })
} else {
  // For development/test, use individual config values
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    ...(dbConfig.dialectOptions && { dialectOptions: dbConfig.dialectOptions }),
  })
}

// Import models
const User = require("./User")(sequelize)
const Post = require("./Post")(sequelize)
const Comment = require("./Comment")(sequelize)
const Notification = require("./Notification")(sequelize)
const Follow = require("./Follow")(sequelize)
const Like = require("./Like")(sequelize)

// Define associations
User.hasMany(Post, { foreignKey: "userId", as: "posts" })
Post.belongsTo(User, { foreignKey: "userId", as: "user" })

User.hasMany(Comment, { foreignKey: "userId", as: "comments" })
Comment.belongsTo(User, { foreignKey: "userId", as: "user" })

Post.hasMany(Comment, { foreignKey: "postId", as: "comments" })
Comment.belongsTo(Post, { foreignKey: "postId", as: "post" })

User.hasMany(Notification, { foreignKey: "recipientId", as: "receivedNotifications" })
User.hasMany(Notification, { foreignKey: "senderId", as: "sentNotifications" })
Notification.belongsTo(User, { foreignKey: "recipientId", as: "recipient" })
Notification.belongsTo(User, { foreignKey: "senderId", as: "sender" })
Notification.belongsTo(Post, { foreignKey: "postId", as: "post" })

// Follow associations
User.belongsToMany(User, {
  through: Follow,
  as: "followers",
  foreignKey: "followingId",
  otherKey: "followerId",
})
User.belongsToMany(User, {
  through: Follow,
  as: "following",
  foreignKey: "followerId",
  otherKey: "followingId",
})

// Like associations
User.belongsToMany(Post, {
  through: Like,
  as: "likedPosts",
  foreignKey: "userId",
  otherKey: "postId",
})
Post.belongsToMany(User, {
  through: Like,
  as: "likedBy",
  foreignKey: "postId",
  otherKey: "userId",
})

module.exports = {
  sequelize,
  User,
  Post,
  Comment,
  Notification,
  Follow,
  Like,
}
