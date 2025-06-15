const { DataTypes } = require("sequelize")
const bcrypt = require("bcryptjs")

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 30],
          isAlphanumeric: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [1, 100],
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [6, 255],
        },
      },
      bio: {
        type: DataTypes.TEXT,
        defaultValue: "",
        validate: {
          len: [0, 500],
        },
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      coverImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isPrivate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      hooks: {
        beforeSave: async (user) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(12)
            user.password = await bcrypt.hash(user.password, salt)
          }
        },
      },
    },
  )

  // Instance methods
  User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
  }

  User.prototype.toJSON = function () {
    const values = { ...this.get() }
    delete values.password
    return values
  }

  return User
}
