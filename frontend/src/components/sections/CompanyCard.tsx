"use client"

import type { Company } from "@/types"
import { useLocale } from "@/lib/locale"
import { ProfileCard } from "./ProfileCard"

export function CompanyCard({ company }: { company: Company }) {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const founder = company.founders?.[0]

  return (
    <ProfileCard
      data={{
        company: company.name,
        logo: company.logoUrl,
        companyBrief: company.description,
        website: company.website,
        location: company.location,
        sector: company.sector,
        stage: company.stage,
        founder: founder?.name,
        portrait: founder?.avatarUrl,
        role: founder?.position,
        founderBrief: founder?.bio || founder?.tagline,
        href: `/founders/companies/${company.slug}`,
        founderHref: founder ? `/founders/${founder.slug}` : undefined,
        founderSocials: founder
          ? [
              { label: "LinkedIn", url: founder.linkedinUrl ?? "" },
              { label: "X", url: founder.twitterUrl ?? "" },
            ].filter((social) => social.url)
          : [],
        signals: [
          company.isHiring
            ? { label: ar ? "ØªÙˆØ¸ÙŠÙ Ù†Ø¶-Èˆˆ’\š[™È‹Û™NˆœİXØÙ\ÜÈˆ\ÈÛÛœİBˆˆ[ˆÛÛ\[Kš\Ñ[™˜Z\Ú[™ÂˆÈÈX™[ˆ\ˆÈ¶+6av.H6)ö,ö*¶*öav)ö,Hˆˆ‘[™˜Z\Ú[™È‹Û™Nˆ˜XØÙ[ˆ\ÈÛÛœİBˆˆ[ˆÛÛ\[Kš\ĞÛÛX›Ü˜][™ÂˆÈÈX™[ˆ\ˆÈ¶ava¶`v*¶+v*H6.va6bH6)öa6*¶.v)öb6aˆˆˆ“Ü[ˆÈÛÛX›Ü˜][Ûˆ‹Û™Nˆ›™]]˜[ˆ\ÈÛÛœİBˆˆ[ˆK™š[\Šˆ
ˆÚYÛ˜[ˆ
NˆÚYÛ˜[\ÈÂˆX™[ˆİš[™ÂˆÛ™NˆœİXØÙ\ÜÈˆ˜XØÙ[ˆ›™]]˜[‚ˆHOˆ›ÛÛX[ŠÚYÛ˜[
Kˆ
Kˆ_BˆÏ‚ˆ
BŸB