"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { useLocale } from "@/lib/locale";
import { safeWebUrl } from "@/lib/gateway";

type Partner = {
  id: number;
  name: string;
  logo_url: string;
  website: string;
  identity_status: string;
  asset_status: string;
  designation_status: string;
  display_order: number;
};
export function PartnerStrip() {
  const { locale } = useLocale();
  const [partners, setPartners] = useState<Partner[]>([]);
  useEffect(() => {
    let active = true;
    api
      .get<{ data: Partner[] }>("/partners", {
        params: { per_page: 50 },
        headers: { "X-Locale": locale },
      })
      .then((r) => {
        if (active)
          setPartners(
            r.data
              .filter(
                (p) =>
                  p.identity_status === "verified" &&
                  p.asset_status === "verified" &&
                  p.designation_status === "approved" &&
                  safeWebUrl(p.website),
              )
              .sort((a, b) => a.display_order - b.display_order),
          );
      })
      .catch(() => {
        if (active) setPartners([]);
      });
    return () => {
      active = false;
    };
  }, [locale]);
  // Unapproved entries stay in the admin queue; a public heading must not imply unconfirmed partnerships.
  if (!partners.length) return null;
  return (
    <section
      aria-labelledby="partner-heading"
      className="border-y border-slate-200 bg-white px-5 py-9"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="partner-heading"
          className="mb-7 text-center text-lg font-bold text-slate-700"
        >
          {locale === "ar" ? "نفخر بشركائنا" : "Proud of Partners"}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {partners.map((p) => (
            <a
              key={p.id}
              href={p.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={p.name}
              className="flex h-20 w-36 items-center justify-center rounded-lg p-2 focus-visible:outline-2 focus-visible:outline-[#3B52D4]"
            >
              <Image
                src={p.logo_url}
                alt={p.name}
                width={160}
                height={64}
                unoptimized
                className="max-h-16 w-auto max-w-full object-contain"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
