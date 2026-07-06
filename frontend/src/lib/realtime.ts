import Echo from "laravel-echo"
import Pusher from "pusher-js"
import { env } from "@/lib/env"

let echoInstance: Echo<"pusher"> | null = null

export function getEcho(token?: string) {
  if (echoInstance) return echoInstance

  const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY || process.env.NEXT_PUBLIC_PUSHER_APP_KEY
  const host = process.env.NEXT_PUBLIC_REVERB_HOST || process.env.NEXT_PUBLIC_PUSHER_HOST
  const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT || process.env.NEXT_PUBLIC_PUSHER_PORT || 6001)
  const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME || process.env.NEXT_PUBLIC_PUSHER_SCHEME || "http"

  if (!key) return null

  ;(window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher

  echoInstance = new Echo({
    broadcaster: "pusher",
    key,
    wsHost: host || window.location.hostname,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === "https",
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${env.apiUrl}/broadcasting/auth`,
    auth: {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          }
        : {
            Accept: "application/json",
          },
    },
    ...(token ? {} : { withCredentials: true }),
  })

  return echoInstance
}

export function closeEcho() {
  if (!echoInstance) return
  echoInstance.disconnect()
  echoInstance = null
}
