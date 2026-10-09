"use client"

import { MapPin, Rocket, Target, Lightbulb, Users, TrendingUp, Wallet, Briefcase } from "lucide-react"
import type { Entrepreneur } from "@/types/entrepreneur"
import { CartoonAvatar } from "@/components/avatars/CartoonAvatar"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useLocale } from "@/lib/locale"

interface EntrepreneurProfileDialogProps {
  entrepreneur: Entrepreneur | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const dialogCopy = {
  ar: {
    about: "نبذة عن الشركة",
    problem: "المشكلة",
    solution: "الحل",
    customers: "العملاء المستهدفون",
    traction: "الأثر والنمو",
    funding: "الاحتياج التمويلي",
    model: "نموذج العمل",
    tags: "الوسوم",
  },
  en: {
    about: "About the startup",
    problem: "Problem solved",
    solution: "Solution",
    customers: "Target customers",
    traction: "Traction",
    funding: "Funding need",
    model: "Business model",
    tags: "Tags",
  },
}

function DetailSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-400">
        <Icon className="h-3.5 w-3.5 text-[#3B52D4]" aria-hidden="true" />
        {title}
      </h4>
      <div className="text-xs leading-relaxed text-slate-600">{children}</div>
    </section>
  )
}

export function EntrepreneurProfileDialog({
  entrepreneur,
  open,
  onOpenChange,
}: EntrepreneurProfileDialogProps) {
  const { locale } = useLocale()
  const copy = dialogCopy[locale] ?? dialogCopy.en

  if (!entrepreneur) return null

  const avatarAlt = `Cartoon avatar of ${entrepreneur.fullName}, entrepreneur from ${entrepreneur.country}.`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        {/* Header band */}
        <div className="rounded-t-2xl bg-gradient-to-r from-[#EEF1FF] to-indigo-50 px-8 pb-6 pt-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-start">
            <CartoonAvatar
              seed={entrepreneur.id}
              gender={entrepreneur.avatar.gender}
              alt={avatarAlt}
              size={88}
              className="ring-4 ring-white shadow-lg"
            />
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl font-black tracking-tight text-slate-900">
                {entrepreneur.fullName}
              </DialogTitle>
              <DialogDescription asChild>
                <div className="mt-1 space-y-1">
                  <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-[#3B52D4] sm:justify-start">
                    <Rocket className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {entrepreneur.startupName}
                  </p>
                  <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500 sm:justify-start">
                    <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {entrepreneur.city}, {entrepreneur.country}
                  </p>
                </div>
              </DialogDescription>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                <span className="rounded-full border border-[#E4E7F0] bg-white px-2.5 py-1 text-xs font-bold text-[#3B52D4]">
                  {entrepreneur.sector}
                </span>
                <span className="rounded-full border border-[#E4E7F0] bg-white px-2.5 py-1 text-xs font-bold text-slate-600">
                  {entrepreneur.startupStage}
                </span>
                <span className="rounded-full border border-[#E4E7F0] bg-white px-2.5 py-1 text-xs font-bold text-slate-600">
                  {entrepreneur.region}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-3 px-8 py-6">
          <DetailSection icon={Briefcase} title={copy.about}>
            <p>{entrepreneur.description}</p>
            <p className="mt-2 text-xs font-bold text-slate-400">
              {copy.model}: <span className="font-medium text-slate-500">{entrepreneur.businessModel}</span>
            </p>
          </DetailSection>

          <DetailSection icon={Target} title={copy.problem}>
            <p>{entrepreneur.problemSolved}</p>
          </DetailSection>

          <DetailSection icon={Lightbulb} title={copy.solution}>
            <p>{entrepreneur.solution}</p>
          </DetailSection>

          <DetailSection icon={Users} title={copy.customers}>
            <ul className="flex flex-wrap gap-1.5">
              {entrepreneur.targetCustomers.map((customer) => (
                <li
                  key={customer}
                  className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200"
                >
                  {customer}
                </li>
              ))}
            </ul>
          </DetailSection>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailSection icon={TrendingUp} title={copy.traction}>
              <p>{entrepreneur.traction}</p>
            </DetailSection>
            <DetailSection icon={Wallet} title={copy.funding}>
              <p>{entrepreneur.fundingNeed}</p>
            </DetailSection>
          </div>

          {/* Tags */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
              {copy.tags}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {entrepreneur.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-[#EEF1FF] px-2 py-0.5 text-xs font-bold text-[#3B52D4]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
