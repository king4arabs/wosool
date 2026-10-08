// Fictional showcase records are opt-in locally and never used in a production build.
export const demoContentEnabled =
  process.env.NODE_ENV !== 'production' &&
  process.env.NEXT_PUBLIC_ENABLE_DEMO_CONTENT === 'true'
