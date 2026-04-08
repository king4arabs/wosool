import type { BoardMember } from "@/types"
import { Users } from "lucide-react"

interface BoardMemberCardProps {
  member: BoardMember
}

export function BoardMemberCard({ member }: BoardMemberCardProps) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow text-center group">
      {/* Avatar */}
      <div className="relative mx-auto mb-4">
        {member.image ? (
          <img
            src={member.image}
            alt={member.name}
            className="h-24 w-24 rounded-full object-cover mx-auto ring-4 ring-[#F8F5EF] group-hover:ring-[#C9A84C]/30 transition-all"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-[#0A1628] flex items-center justify-center mx-auto ring-4 ring-[#F8F5EF] group-hover:ring-[#C9A84C]/30 transition-all">
            <span className="text-xl font-bold text-[#C9A84C]">{initials}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="font-bold text-[#0A1628] text-lg mb-1">{member.name}</h3>
      <p className="text-sm font-medium text-[#C9A84C] mb-3">{member.companyName}</p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">{member.brief}</p>

      {/* LinkedIn */}
      <a
        href={member.linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#0A1628] hover:text-[#C9A84C] transition-colors"
        aria-label={`${member.name} on LinkedIn`}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        LinkedIn
      </a>
    </div>
  )
}
