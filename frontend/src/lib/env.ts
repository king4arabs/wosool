/** Environment configuration with type safety */
export const env = {
  /** Base URL for the backend API */
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  /** Public site URL */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://wosool.org",
  /** Whether we're in production */
  isProduction: process.env.NODE_ENV === "production",
  /** Whether we're in development */
  isDevelopment: process.env.NODE_ENV === "development",
} as const
