import type { ApiFounder } from "./content-api"

/** Only a member-owned, active, publicly listed profile may advertise grid links. */
export function isFounderProfileEligibleForPublicCard(
  profile: Pick<ApiFounder, "slug" | "status" | "is_public" | "activation_status"> | null | undefined,
): boolean {
  return Boolean(profile?.slug) && profile?.status === "active" && profile?.is_public === true && profile?.activation_status === "active"
}

/** Both grids resolve this same canonical founder slug, never a duplicate card record. */
export function founderCardLinks(slug: string) {
  const encoded = encodeURIComponent(slug)
  return {
    home: "/?founder=" + encoded + "#founder-community",
    directory: "/founders?founder=" + encoded + "#founder-directory",
    profile: "/founders/" + encoded,
  }
}

/** Parse only the expected public-card slug; never accept an oversized query value. */
export function linkedFounderSlug(search: string): string {
  const value = new URLSearchParams(search).get("founder")?.trim() ?? ""
  return value.length <= 255 ? value : ""
}

/** Keep a slug-filtered grid safe if the API is temporarily on an older release. */
export function exactLinkedFounderCards<T extends { slug: string }>(founders: readonly T[], slug: string): T[] {
  return slug ? founders.filter(founder => founder.slug === slug) : [...founders]
}
