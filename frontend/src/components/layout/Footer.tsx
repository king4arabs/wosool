import Link from "next/link"
import { Globe, AtSign, Share2 } from "lucide-react"

const footerLinks = {
  Platform: [
    { href: "/founders", label: "Founders Directory" },
    { href: "/founders/companies", label: "Founders' Companies" },
    { href: "/events", label: "Events Calendar" },
    { href: "/apply", label: "Apply to Join" },
  ],
  Programs: [
    { href: "/programs", label: "All Programs" },
    { href: "/programs#founder-circles", label: "Founder Circles" },
    { href: "/programs#growth-track", label: "Growth Track" },
    { href: "/programs#fundraising", label: "Fundraising Readiness" },
  ],
  Community: [
    { href: "/news", label: "News & Insights" },
    { href: "/partners", label: "Partners" },
    { href: "/sponsors", label: "Sponsors" },
    { href: "/contact", label: "Contact" },
  ],
  Company: [
    { href: "/about", label: "About Wosool" },
    { href: "/about#principles", label: "Our Principles" },
    { href: "/about#team", label: "Leadership" },
    { href: "/contact", label: "Get in Touch" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-[#0A1628] text-white" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-white">Wosool</span>
              <span className="text-sm text-[#C9A84C] font-medium tracking-widest uppercase">
                وصول
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              A premium founders-to-founders network for ambitious entrepreneurs
              building in Saudi Arabia and the GCC.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com/AboutWosool"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Wosool on Twitter"
                className="p-2 rounded-md text-gray-400 hover:text-[#C9A84C] hover:bg-white/5 transition-colors"
              >
                <AtSign className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/wosool"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Wosool on LinkedIn"
                className="p-2 rounded-md text-gray-400 hover:text-[#C9A84C] hover:bg-white/5 transition-colors"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com/aboutwosool"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Wosool on Instagram"
                className="p-2 rounded-md text-gray-400 hover:text-[#C9A84C] hover:bg-white/5 transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-[#C9A84C] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Wosool. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Terms of Use
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
