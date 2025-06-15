const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Follow = sequelize.define(
    "Follow",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      followerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      followingId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      tableName: "follows",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["followerId", "followingId"],
        },
      ],
    },
  )

  return Follow
}
