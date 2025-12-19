import { sequelizeInstance } from "../util/database.js";
import { DataTypes } from "sequelize";

export const dd_stock = sequelizeInstance.define(
  "dd_stock",
  {
    dd_stock_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    ticker_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "dd_ticker_lists",
        key: "ticker_id",
      },
    },

    stock_security_code: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    ticker_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    stock_isin_no: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    ticker_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    previous_close: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    number_of_ladder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    number_of_watchlist: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    ticker_exchange: {
      type: DataTypes.ENUM("NSE", "BSE", "NASDAQ", "NYSE"),
      allowNull: true,
    },

    angelonenewclosedprice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    Timestamp: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "dd_stock",
    timestamps: false,
  }
);
