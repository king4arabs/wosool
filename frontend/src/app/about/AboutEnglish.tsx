import Link from "next/link"
import { Globe, Heart, Lightbulb, Shield, Users } from "lucide-react"
import { PageHero } from "@/components/sections/PageHero"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { WosoolBoard } from "@/components/sections/WosoolBoard"
import { Button } from "@/components/ui/button"

const objectives = [
  { title: "Share experience", text: "Create a trusted space where founders can share practical lessons and talk candidly about challenges." },
  { title: "Build meaningful connections", text: "Bring founders together with peers, partners, and the people who can help them move forward." },
  { title: "Turn connection into impact", text: "Make room for collaborations that help founders strengthen their companies and find new opportunities." },
]

const principles = [
  { icon: Shield, title: "Founders first", text: "Every decision starts with a question: does it create real value for founders?" },
  { icon: Heart, title: "Trust before scale", text: "A smaller, engaged community matters more than a wide network without depth." },
  { icon: Lightbulb, title: "Clarity over comfort", text: "Honest feedback helps founders make better decisions." },
  { icon: Globe, title: "Local roots, global ambition", text: "We understand the Saudi and Gulf landscape while looking beyond it." },
  { icon: Users, title: "Give as you grow", text: "Members build the community by sharing their time, experience, and connections." },
]

export function AboutEnglish() {
  return (
    <PublicLayout>
      <div lang="en" dir="ltr">
        <PageHero tone="dark" eyebrow="Our story" title="About Wosool" description="Born in London. Built by founders, for founders." />

        <section className="bg-[var(--surface)] px-4 py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold tracking-widest text-[var(--link)]">OUR MISSION</p>
              <h2 className="mb-6 text-4xl font-bold text-[var(--text-strong)]">Founders to founders</h2>
              <p className="leading-relaxed text-[var(--text-muted)]">
                We bring founders together to exchange experience and support one another, opening paths to the relationships, opportunities, and resources they need to build their companies. Every introduction is a chance to create value that lasts beyond the first conversation.
              </p>
            </div>
            <div className="rounded-3xl bg-[var(--surface-soft)] p-10">
              <p className="mb-3 text-sm font-semibold tracking-widest text-[var(--link)]">OUR VISION</p>
              <h2 className="mb-4 text-2xl font-bold text-[var(--text-strong)]">A community that grows by giving</h2>
              <p className="leading-relaxed text-[var(--text-muted)]">
                A network of founders reaching from Saudi Arabia to the world, helping one another build stronger companies and lasting impact.
              </p>
            </div>
          </div>
        </section>

        <section id="story" className="bg-[var(--surface-soft)] px-4 py-24">
          <div className="mx-auto max-w-4xl">
            <SectionHeader eyebrow="THE WOSOOL STORY" heading="It started in London" centered />
            <div className="space-y-5 rounded-2xl bg-[var(--surface)] p-8 leading-relaxed text-[var(--text-muted)] shadow-sm">
              <p>During Multiverse, a program by CODE at Saudi Arabia&apos;s Ministry of Communications and Information Technology (MCIT), founders met in London and discovered how much value they could create for one another by sharing experience and support.</p>
              <p>They did not want that exchange to end with the program. With the founders&apos; commitment and MCIT&apos;s support, Wosool grew into a formal founders-to-founders community built around collaboration and trust.</p>
              <p>Special thanks to His Excellency Al-Swaha, His Excellency Al-Robai&apos;an, and the MCIT teams for their support.</p>
            </div>
          </div>
        </section>

        <section id="objectives" className="bg-[var(--surface)] px-4 py-24">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="OUR OBJECTIVES" heading="What we are here to do" centered />
            <div className="grid gap-6 md:grid-cols-3">
              {objectives.map(({ title, text }) => (
                <article key={title} className="rounded-2xl bg-[var(--surface-soft)] p-8">
                  <h3 className="mb-3 text-xl font-bold text-[var(--text-strong)]">{title}</h3>
                  <p className="leading-relaxed text-[var(--text-muted)]">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="principles" className="bg-[var(--surface-soft)] px-4 py-24">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="OUR PRINCIPLES" heading="The values behind every connection" centered />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {principles.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-2xl bg-[var(--surface)] p-6">
                  <Icon className="mb-4 h-6 w-6 text-[var(--link)]" aria-hidden="true" />
                  <h3 className="mb-2 font-semibold text-[var(--text-strong)]">{title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)]">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <WosoolBoard />

        <section className="bg-[var(--surface)] px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-[var(--text-strong)]">Contact us</h2>
          <a className="mt-3 inline-block text-lg font-semibold text-[var(--link)] underline underline-offset-4" href="mailto:info@wosool.org">info@wosool.org</a>
        </section>
        <section className="bg-[var(--surface-blue)] px-4 py-20 text-center">
          <h2 className="mb-4 text-3xl font-bold text-[var(--text-strong)]">Ready to be part of the story?</h2>
          <p className="mb-8 text-[var(--text-muted)]">Applications are reviewed with the community&apos;s fit and each founder&apos;s contribution in mind.</p>
          <Button asChild size="lg" variant="secondary"><Link href="/apply">Apply to join Wosool</Link></Button>
        </section>
      </div>
    </PublicLayout>
  )
}
