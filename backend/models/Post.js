const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Post = sequelize.define(
    "Post",
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
          len: [1, 2000],
        },
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "posts",
      timestamps: true,
      indexes: [
        {
          fields: ["userId", "createdAt"],
        },
        {
          fields: ["createdAt"],
        },
      ],
    },
  )

  return Post
}
