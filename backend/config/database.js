require("dotenv").config()

// Parse PostgreSQL URL if provided
const parsePostgresUrl = (url) => {
  if (!url) return null

  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
  if (!match) return null

  return {
    username: match[1],
    password: match[2],
    host: match[3],
    port: Number.parseInt(match[4]),
    database: match[5],
  }
}

const postgresUrl = process.env.DATABASE_URL || "postgresql://postgres:123@localhost:5433/social_db"
const parsedUrl = parsePostgresUrl(postgresUrl)

module.exports = {
  development: {
    username: parsedUrl?.username || process.env.DB_USER || "postgres",
    password: parsedUrl?.password || process.env.DB_PASSWORD || "123",
    database: parsedUrl?.database || process.env.DB_NAME || "social_db",
    host: parsedUrl?.host || process.env.DB_HOST || "localhost",
    port: parsedUrl?.port || process.env.DB_PORT || 5433,
    dialect: "postgres",
    logging: console.log,
  },
  test: {
    username: parsedUrl?.username || process.env.DB_USER || "postgres",
    password: parsedUrl?.password || process.env.DB_PASSWORD || "123",
    database: process.env.DB_NAME_TEST || "social_db_test",
    host: parsedUrl?.host || process.env.DB_HOST || "localhost",
    port: parsedUrl?.port || process.env.DB_PORT || 5433,
    dialect: "postgres",
    logging: false,
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
}
