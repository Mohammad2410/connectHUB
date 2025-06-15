const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Comment = sequelize.define(
    "Comment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [1, 1000],
        },
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      postId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "posts",
          key: "id",
        },
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "comments",
      timestamps: true,
      indexes: [
        {
          fields: ["postId", "createdAt"],
        },
      ],
    },
  )

  return Comment
}
