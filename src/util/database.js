import { Sequelize } from "sequelize";
import dbConfig from "../config/db.config.js";

export const sequelizeInstance = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    dialect: dbConfig.dialect,
    host: dbConfig.host,
    port: 3306,
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 2000,
    },
    timezone: "+00:00",
    logging: dbConfig.logging,
  }
);

export const connectDatabase = async () => {
  try {
    await sequelizeInstance.authenticate();
    console.log("Database connection established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};
