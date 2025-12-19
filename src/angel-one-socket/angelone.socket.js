import { WebSocketV2 } from "smartapi-javascript";
import { publishToRedis } from "../util/redis.publish.js";
import { redis } from "../config/redis.config.js";

let ws = null;

let subscribedTokens = new Set()
let symbolMap = {}
let lastPriceMap = {}

const updateSymbolMap = (symbols) => {
  symbols.forEach(s => {
    symbolMap[s.stock_security_code] = {
      symbol: s.ticker_name,
      exchange: s.ticker_exchange,
    }
  })
}

export const subscribeMissingSymbols = async (symbols) => {
  if (!ws) return

  const redisPrices = await redis.hgetall("REALTIME_PRICE")

  const newNseTokens = []
  const newBseTokens = []

  for (const s of symbols) {
    const token = s.stock_security_code
    const tickerKey = `${s.ticker_name}-${s.ticker_exchange}`

    if (subscribedTokens.has(token)) continue
    if (redisPrices[tickerKey]) continue
    if (s.ticker_exchange === "NSE") {
      newNseTokens.push(token)
    } else if (s.ticker_exchange === "BSE") {
      newBseTokens.push(token)
    }

    subscribedTokens.add(token)
  }

  if (subscribedTokens.size > 2500) {
    console.error("Subscribed tokens exceed limit, stopping subscriptions")
    return
  }

  if (newNseTokens.length) {
    ws.fetchData({
      action: 1,
      mode: 1,
      exchangeType: 1,
      tokens: newNseTokens
    })
  }

  if (newBseTokens.length) {
    ws.fetchData({
      action: 1,
      mode: 1,
      exchangeType: 3,
      tokens: newBseTokens
    })
  }

  if (newNseTokens.length || newBseTokens.length) {
    console.log(`Subscribed to ${newNseTokens.length + newBseTokens.length} new tokens`)
  }
}

export const startPriceFeed = async ({ jwtToken, feedToken, symbols, onOpen }) => {

  subscribedTokens.clear()
  Object.keys(lastPriceMap).forEach(k => delete lastPriceMap[k])

  updateSymbolMap(symbols)

  ws = new WebSocketV2({
    jwttoken: jwtToken,
    apikey: process.env.ANGEL_API_KEY,
    clientcode: process.env.ANGEL_CLIENT_ID,
    feedtype: feedToken
  })

  ws.on("open", () => {
    console.log("Angel websocket connected")
    if (onOpen) onOpen()
  })

  ws.on("tick", async (data) => {

    if (!data || data === "pong") return

    const token = Number(String(data.token).replace(/"/g, ""))
    const meta = symbolMap[token]
    if (!meta) return

    const price = Number(data.last_traded_price) / 100
    if (!price) return

    if (lastPriceMap[token] === price) return
    lastPriceMap[token] = price

    const tickerKey = `${meta.symbol}-${meta.exchange}`
    await publishToRedis(tickerKey, price)
  })

  ws.on("close", () => {
    console.error("Angel price feed closed")
  })

  ws.on("error", (err) => {
    console.error("Angel WebSocket error", err)
  })

  await ws.connect()

  await subscribeMissingSymbols(symbols)
}

export const stopPriceFeed = () => {
  if (ws) {
    ws.close()
    ws = null
  }
}