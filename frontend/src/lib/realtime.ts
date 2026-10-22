import Echo from "laravel-echo"
import Pusher from "pusher-js"
import { sessionFetch } from "./session-request"

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
    channelAuthorization: {
      customHandler: (params: { socketId: string; channelName: string }, callback: (error: Error | null, data: { auth: string } | null) => void) => {
        void sessionFetch("/broadcasting/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ socket_id: params.socketId, channel_name: params.channelName }),
        }).then(async response => {
          if (!response.ok) throw new Error("Unable to authorize conversation")
          callback(null, await response.json())
        }).catch(error => callback(error instanceof Error ? error : new Error("Unable to connect"), null))
      },
    },
  })

  return echoInstance
}

export function closeEcho() {
  if (!echoInstance) return
  echoInstance.disconnect()
  echoInstance = null
}
