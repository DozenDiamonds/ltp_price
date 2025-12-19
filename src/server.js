import "dotenv/config"
import { generateSession } from "./angel-one-socket/angel.session.js"
import { startPriceFeed, stopPriceFeed, subscribeMissingSymbols } from "./angel-one-socket/angelone.socket.js"
import { userSelectedStocks } from "./util/symbols.js"

let reconcileRun = false
let lastReconcileTime = 0

const COOLDOWN = 30 * 1000
const FALLBACK_INTERVAL = 5 * 60 * 1000

const triggerReconcile = async () => {
  const now = Date.now()

  if (reconcileRun) return
  if (now - lastReconcileTime < COOLDOWN) return

  reconcileRun = true
  lastReconcileTime = now

  try {
    console.log("Triggering reconcile for missing symbols")
    const symbols = await userSelectedStocks()
    await subscribeMissingSymbols(symbols)
  } catch (error) {
    console.error("Error during reconcile", error)
  } finally {
    reconcileRun = false
  }
}

const start = async () => {

  let symbols = await userSelectedStocks()

  console.log("Symbols loaded:", symbols.length)

  if (!symbols.length) {
    throw new Error("No symbols available for price feed")
  }

  const { jwtToken, feedToken } = await generateSession()

  await startPriceFeed({
    jwtToken,
    feedToken,
    symbols,
    onOpen: triggerReconcile
  })

  await triggerReconcile()

  setInterval(triggerReconcile, FALLBACK_INTERVAL)

  setInterval(async () => {
    console.log("Refreshing Angel session")

    stopPriceFeed()
    reconcileRun = false
    lastReconcileTime = 0

    const session = await generateSession()

    const latestSymbols = await userSelectedStocks()

    await startPriceFeed({
      ...session,
      symbols: latestSymbols,
      onOpen: triggerReconcile
    })
  }, 12 * 60 * 60 * 1000)
}

start().catch(err => {
  console.error("Price feed server failed", err)
  process.exit(1)
})
