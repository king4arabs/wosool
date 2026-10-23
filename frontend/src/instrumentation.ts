import type { Instrumentation } from "next"
import { sanitizedRuntimeError } from "./lib/runtime-diagnostics"

export const onRequestError: Instrumentation.onRequestError = (error) => {
  console.error(JSON.stringify(sanitizedRuntimeError(error, "NEXT_REQUEST_FAILED")))
}
