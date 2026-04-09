import { PublicLayout } from "@/components/layout/PublicLayout"
import { Badge } from "@/components/ui/badge"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Wosool Terms of Service — read our terms and conditions for using the platform.",
}

export default function TermsPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#0A1628] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="gold" className="mb-4 uppercase tracking-widest text-xs px-4 py-1.5">
            Legal
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Terms of Service</h1>
          <p className="text-gray-400 text-sm">Last updated: April 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto prose prose-gray prose-headings:text-[#0A1628] prose-a:text-[#C9A84C]">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Wosool platform (&ldquo;Platform&rdquo;), you agree to be bound
            by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, you
            may not access or use the Platform.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Wosool is a curated, invite-and-apply founders network focused on the Saudi Arabia
            and GCC startup ecosystem. The Platform provides community access, founder matching,
            events, programs, and resources to approved members.
          </p>

          <h2>3. Eligibility</h2>
          <p>
            You must be at least 18 years old and an active founder, co-founder, or senior
            executive of a company to apply for membership. Wosool reserves the right to accept
            or decline any application at its sole discretion.
          </p>

          <h2>4. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials
            and for all activities that occur under your account. You agree to notify Wosool
            immediately of any unauthorised use of your account.
          </p>

          <h2>5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Platform for any unlawful purpose or in violation of any applicable laws</li>
            <li>Share confidential information from other members without consent</li>
            <li>Engage in spamming, harassment, or abusive behaviour toward other members</li>
            <li>Misrepresent your identity, credentials, or company information</li>
            <li>Attempt to gain unauthorised access to Platform systems or other user accounts</li>
            <li>Use the Platform for direct solicitation without prior consent from the recipient</li>
          </ul>

          <h2>6. Intellectual Property</h2>
          <p>
            All content, designs, logos, and materials on the Platform are the property of Wosool
            or its licensors. You may not reproduce, distribute, or create derivative works without
            prior written consent.
          </p>

          <h2>7. Membership & Fees</h2>
          <p>
            Membership tiers and associated fees are communicated during the onboarding process.
            Fees are non-refundable unless otherwise stated. Wosool reserves the right to modify
            pricing with 30 days&apos; notice to existing members.
          </p>

          <h2>8. Termination</h2>
          <p>
            Wosool may suspend or terminate your access to the Platform at any time for violation
            of these Terms or for any other reason at its discretion. You may cancel your membership
            at any time through your account settings.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            The Platform is provided &ldquo;as is&rdquo; without warranties of any kind. Wosool shall not be
            liable for any indirect, incidental, or consequential damages arising from your use
            of the Platform.
          </p>

          <h2>10. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the
            Kingdom of Saudi Arabia. Any disputes arising from these Terms shall be resolved
            through the competent courts in Riyadh, Saudi Arabia.
          </p>

          <h2>11. Changes to Terms</h2>
          <p>
            Wosool may update these Terms from time to time. We will notify members of material
            changes via email or through the Platform. Continued use of the Platform after changes
            constitutes acceptance of the updated Terms.
          </p>

          <h2>12. Contact</h2>
          <p>
            For questions about these Terms, please contact us at{" "}
            <a href="mailto:legal@wosool.org">legal@wosool.org</a>.
          </p>
        </div>
      </section>
    </PublicLayout>
  )
}
