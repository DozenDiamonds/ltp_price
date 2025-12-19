import { SmartAPI } from "smartapi-javascript"
import { TOTP } from "totp-generator"

const smartApi = new SmartAPI({
  api_key: process.env.ANGEL_API_KEY,
})

export const generateSession = async () => {
  console.log(">>> [SESSION] Generating Angel session")
  const token = await TOTP.generate(process.env.ANGEL_SECRET_KEY)

  const session = await smartApi.generateSession(
    process.env.ANGEL_CLIENT_ID,
    process.env.ANGEL_PIN,
    `${token.otp}`
  )

  if (!session?.data?.jwtToken) {
    console.error("Angel session generation failed", session)
    throw new Error("Angel session generation failed")
  }
  console.log("✅ [SESSION] Angel session success")
  return {
    jwtToken: session.data.jwtToken,
    feedToken: session.data.feedToken,
  }
}
