/** Only link to explicit HTTP(S) websites, never executable or relative URLs. */
export function publicWebsite(value?: string): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : undefined
  } catch { return undefined }
}

/** Preserve API ranking while distributing real profiles across two independent rows. */
export function founderRows<T>(items: T[]): T[][] {
  return [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)].filter(row => row.length)
}
