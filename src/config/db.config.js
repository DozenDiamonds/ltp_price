import "dotenv/config";

const ENV = process.env.ENVIRONMENT || "dev";

const getEnvVar = (key) => process.env[key] || "";

const dbConfig = {
  username: getEnvVar(`${ENV.toUpperCase()}_DB_USERNAME`),
  password: getEnvVar(`${ENV.toUpperCase()}_DB_PASSWORD`),
  database: getEnvVar(`${ENV.toUpperCase()}_DB_NAME`),
  host: getEnvVar(`${ENV.toUpperCase()}_DB_HOST`),
  dialect: "mysql",
  logging: false,
};

export default dbConfig;
