import { redis } from "../config/redis.config.js";

export const publishToRedis = async (tickerKey, price) => {
  try {
    const time = new Date().toISOString();

    await redis
      .multi()
      .hset("REALTIME_PRICE", tickerKey, price)
      .hset("REALTIME_PRICE_UPDATE_TIME", tickerKey, time)
      .publish("WATCHLIST_PRICE_CHANNEL", JSON.stringify({
        ticker: tickerKey,
        price: price,
        time: time,
        previous_close: 0,
      }))
      .exec()
  } catch (error) {
    console.error(`Error publishing to Redis channel:`, error);
  }
}