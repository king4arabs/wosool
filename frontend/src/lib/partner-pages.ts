import type { ApiPartner } from './content-api'

type PartnerPage = { data: ApiPartner[]; meta?: { last_page?: number } }

/** Request every public page without relying on potentially external next URLs. */
export async function loadPartnerPages(fetchPage: (page: number) => Promise<PartnerPage>) {
  const partners = new Map<number, ApiPartner>()
  let lastPage = 1
  for (let page = 1; page <= lastPage; page += 1) {
    const response = await fetchPage(page)
    if (!Array.isArray(response.data)) throw new Error('Invalid partner response')
    const last = response.meta?.last_page ?? 1
    if (!Number.isInteger(last) || last < page || last > 1000) throw new Error('Invalid partner pagination')
    lastPage = last
    for (const partner of response.data) partners.set(partner.id, partner)
  }
  return { data: [...partners.values()] }
}
