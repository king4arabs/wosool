import { PublicLayout } from "@/components/layout/PublicLayout"
import { Badge } from "@/components/ui/badge"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Wosool Privacy Policy — learn how we collect, use, and protect your data.",
}

export default function PrivacyPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#0A1628] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="gold" className="mb-4 uppercase tracking-widest text-xs px-4 py-1.5">
            Legal
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-gray-400 text-sm">Last updated: April 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto prose prose-gray prose-headings:text-[#0A1628] prose-a:text-[#C9A84C]">
          <h2>1. Introduction</h2>
          <p>
            Wosool (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to
            protecting and respecting your privacy. This Privacy Policy explains how we collect,
            use, store, and share your personal data when you use the Wosool platform
            (&ldquo;Platform&rdquo;).
          </p>

          <h2>2. Data We Collect</h2>
          <p>We may collect the following types of personal data:</p>
          <ul>
            <li>
              <strong>Account information:</strong> name, email address, phone number, company name,
              role, location, and LinkedIn profile URL
            </li>
            <li>
              <strong>Application data:</strong> sector, company stage, motivation, skills offered
              and needed, referral source
            </li>
            <li>
              <strong>Usage data:</strong> pages visited, features used, time spent on the Platform,
              device and browser information
            </li>
            <li>
              <strong>Communication data:</strong> messages sent through the Platform, contact form
              submissions, and support enquiries
            </li>
          </ul>

          <h2>3. How We Use Your Data</h2>
          <p>We use your personal data to:</p>
          <ul>
            <li>Provide and maintain the Platform and its features</li>
            <li>Process and evaluate your membership application</li>
            <li>Match you with relevant founders and opportunities</li>
            <li>Send you relevant updates, event invitations, and community announcements</li>
            <li>Improve the Platform through analytics and user research</li>
            <li>Comply with legal obligations and enforce our Terms of Service</li>
          </ul>

          <h2>4. Legal Basis for Processing</h2>
          <p>We process your personal data based on:</p>
          <ul>
            <li><strong>Contract performance:</strong> to provide the services you have requested</li>
            <li><strong>Legitimate interest:</strong> to improve the Platform and communicate relevant content</li>
            <li><strong>Consent:</strong> where explicitly provided (e.g., marketing communications)</li>
            <li><strong>Legal obligation:</strong> to comply with applicable laws and regulations</li>
          </ul>

          <h2>5. Data Sharing</h2>
          <p>
            We do not sell your personal data. We may share your data with:
          </p>
          <ul>
            <li>
              <strong>Other members:</strong> your public profile information (name, company, sector,
              stage) is visible to other approved members
            </li>
            <li>
              <strong>Service providers:</strong> third-party services that help us operate the
              Platform (hosting, analytics, email delivery)
            </li>
            <li>
              <strong>Legal requirements:</strong> when required by law, regulation, or court order
            </li>
          </ul>

          <h2>6. Data Security</h2>
          <p>
            We implement appropriate technical and organisational measures to protect your personal
            data against unauthorised access, alteration, disclosure, or destruction. These include
            encryption in transit (TLS/HTTPS), secure database access controls, and regular security
            reviews.
          </p>

          <h2>7. Data Retention</h2>
          <p>
            We retain your personal data for as long as your account is active or as needed to
            provide you with services. If you close your account, we will delete or anonymise your
            data within 90 days, unless retention is required by law.
          </p>

          <h2>8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict certain processing activities</li>
            <li>Request data portability</li>
            <li>Withdraw consent where processing is consent-based</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us at{" "}
            <a href="mailto:privacy@wosool.org">privacy@wosool.org</a>.
          </p>

          <h2>9. Cookies and Tracking</h2>
          <p>
            We use essential cookies to maintain your session and preferences. We may use analytics
            tools to understand how the Platform is used. You can manage your cookie preferences
            through your browser settings.
          </p>

          <h2>10. International Data Transfers</h2>
          <p>
            Your data may be processed in servers located outside the Kingdom of Saudi Arabia.
            Where this occurs, we ensure appropriate safeguards are in place to protect your data
            in accordance with applicable data protection laws.
          </p>

          <h2>11. Children&apos;s Privacy</h2>
          <p>
            The Platform is not intended for individuals under 18 years of age. We do not knowingly
            collect personal data from children.
          </p>

          <h2>12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material
            changes via email or through the Platform. The &ldquo;Last updated&rdquo; date at the
            top of this page indicates when this policy was last revised.
          </p>

          <h2>13. Contact Us</h2>
          <p>
            For questions or concerns about this Privacy Policy or your data, please contact us at{" "}
            <a href="mailto:privacy@wosool.org">privacy@wosool.org</a>.
          </p>
        </div>
      </section>
    </PublicLayout>
  )
}
