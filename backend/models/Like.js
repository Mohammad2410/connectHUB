const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Like = sequelize.define(
    "Like",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
    },
    {
      tableName: "likes",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["userId", "postId"],
        },
      ],
    },
  )

  return Like
}
