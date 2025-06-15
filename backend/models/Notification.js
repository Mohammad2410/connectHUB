const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      recipientId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      type: {
        type: DataTypes.ENUM("like", "comment", "follow"),
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      postId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "posts",
          key: "id",
        },
      },
      read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "notifications",
      timestamps: true,
      indexes: [
        {
          fields: ["recipientId", "createdAt"],
        },
        {
          fields: ["recipientId", "read"],
        },
      ],
    },
  )

  return Notification
}
