import { Op } from "sequelize";
import { dd_stock } from "../models/stock.model.js";

export const userSelectedStocks = async () => {
  return dd_stock.findAll({
    attributes: [
      "ticker_name",
      "ticker_id",
      "stock_security_code",
      "stock_isin_no",
      "ticker_exchange",
      "ticker_price",
    ],
    where: {
      [Op.or]: [
        { number_of_ladder: { [Op.gt]: 0 } },
        { number_of_watchlist: { [Op.gt]: 0 } },
      ]
    },
    group: ["stock_security_code"],
    raw: true,
  })
}