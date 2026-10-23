import test from "node:test"
import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { once } from "node:events"

test("production startup serves health, homepage and EOA without runtime configuration", { timeout: 60000 }, async () => {
  const env = { ...process.env }
  delete env.NEXT_PUBLIC_SITE_URL
  delete env.NEXT_PUBLIC_API_URL
  delete env.NEXT_PUBLIC_ENABLE_DEMO_CONTENT
  const app = spawn(process.execPath, [
    "node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "18082",
  ], { env, stdio: ["ignore", "pipe", "pipe"] })
  let ready = false
  // Never print captured Next.js output: it may contain private exception messages.
  app.stdout.on("data", data => { if (data.toString().includes("Ready")) ready = true })
  app.stderr.resume()
  try {
    for (let attempt = 0; attempt < 200 && !ready && app.exitCode === null; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    assert.ok(ready, `Next.js did not start; exit status: ${app.exitCode ?? "still running"}`)
    for (const path of ["/health", "/", "/eoa"]) {
      const response = await fetch(`http://127.0.0.1:18082${path}`, {
        redirect: "manual", signal: AbortSignal.timeout(10000),
      })
      assert.equal(response.status, 200, `${path} must return 200`)
      if (path === "/health") {
        assert.equal((await response.json()).service, "wosool-frontend")
        assert.match(response.headers.get("cache-control"), /no-store/)
      } else {
        assert.match(response.headers.get("content-type"), /text\/html/)
        assert.match(await response.text(), /Wosool|وصول/i)
      }
    }
  } finally {
    if (app.exitCode === null && app.signalCode === null) {
      const exited = once(app, "exit")
      app.kill("SIGTERM")
      const forceKill = setTimeout(() => app.kill("SIGKILL"), 5000)
      try { await exited } finally { clearTimeout(forceKill) }
    }
  }
})
