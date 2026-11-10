const gitRevision = /^[0-9a-f]{7,40}$/i

type ReleaseRevisionEnv = {
  WOSOOL_BUILD_REVISION?: string
  GITHUB_SHA?: string
}

export function normalizeReleaseRevision(value: string | undefined | null): string | null {
  if (typeof value !== "string") return null
  const revision = value.trim()
  return gitRevision.test(revision) ? revision.toLowerCase() : null
}

export function getFrontendReleaseRevision(
  env: ReleaseRevisionEnv = {
    WOSOOL_BUILD_REVISION: process.env.WOSOOL_BUILD_REVISION,
    GITHUB_SHA: process.env.GITHUB_SHA,
  },
): string | null {
  const configured = env.WOSOOL_BUILD_REVISION
  if (typeof configured === "string" && configured.trim() !== "") {
    return normalizeReleaseRevision(configured)
  }

  return normalizeReleaseRevision(env.GITHUB_SHA)
}
