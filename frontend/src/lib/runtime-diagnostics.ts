/** Never include exception messages, request data, environment values or source paths. */
export function sanitizedRuntimeError(error: unknown, code: string) {
  const knownTypes = ["Error", "TypeError", "RangeError", "SyntaxError", "ReferenceError", "URIError", "AggregateError"]
  const type = error instanceof Error && knownTypes.includes(error.name) ? error.name : "Error"
  const stack = error instanceof Error && typeof error.stack === "string"
    ? error.stack.split("\n").slice(1, 11).flatMap((frame) => {
      const position = frame.match(/:(\d+):(\d+)\)?$/)
      return position ? [`at <redacted>:${position[1]}:${position[2]}`] : []
    })
    : []
  return { code, type, stack }
}
