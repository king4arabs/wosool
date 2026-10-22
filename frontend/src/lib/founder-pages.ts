import type { ApiFounder } from './content-api'

type FounderPage = { data: ApiFounder[]; meta?: { last_page?: number } }

/** Read the whole anonymous collection; never follow server-supplied external URLs. */
export async function loadFounderPages(fetchPage: (page: number) => Promise<FounderPage>) {
  const founders = new Map<string, ApiFounder>()
  let lastPage = 1
  for (let page = 1; page <= lastPage; page++) {
    const response = await fetchPage(page)
    if (!Array.isArray(response.data)) throw new Error('Invalid founder response')
    const last = response.meta?.last_page ?? 1
    if (!Number.isInteger(last) || last < page || last > 20) throw new Error('Invalid founder pagination')
    lastPage = last
    for (const founder of response.data) founders.set(founder.slug, founder)
  }
  return { data: [...founders.values()] }
}
