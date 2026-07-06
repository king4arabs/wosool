import type { EntrepreneurGender } from "@/types/entrepreneur"
import { cn } from "@/lib/utils"

/**
 * Deterministic, dependency-free cartoon avatar system.
 *
 * Every avatar is a lightweight inline SVG rendered from a seed string
 * (typically the entrepreneur id or full name). The same seed always
 * produces the same combination of skin tone, hair, clothing, accessory,
 * and background shape. The male/female illustration style is driven
 * exclusively by the explicit `gender` prop — never guessed from names.
 */

export interface CartoonAvatarProps {
  /** Stable seed, e.g. entrepreneur id or fullName. */
  seed: string
  gender: EntrepreneurGender
  /** Accessible description, e.g. "Cartoon avatar of Noura Alharbi, Saudi entrepreneur." */
  alt: string
  /** Rendered pixel size (SVG scales losslessly). */
  size?: number
  className?: string
}

/* ── Deterministic hashing ─────────────────────────────────────────── */

function hashSeed(seed: string): number {
  // FNV-1a: tiny, fast, stable across runtimes.
  let hash = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

function pick<T>(items: readonly T[], hash: number, salt: number): T {
  // Rotate the hash per attribute so traits vary independently.
  const rotated = ((hash >>> (salt % 24)) ^ (hash << (salt % 7))) >>> 0
  return items[rotated % items.length]
}

/* ── Palettes (AA-contrast friendly on light and dark surfaces) ────── */

const SKIN_TONES = [
  { base: "#F6D3B3", shadow: "#E9BC94" },
  { base: "#EDBE96", shadow: "#DCA678" },
  { base: "#D9A066", shadow: "#C48A50" },
  { base: "#B97B4C", shadow: "#A26538" },
  { base: "#8C5A33", shadow: "#754823" },
  { base: "#69432A", shadow: "#55331D" },
] as const

const HAIR_COLORS = ["#20242C", "#3B2A20", "#5C4030", "#7B5B3A", "#8A8D93", "#463A50"] as const

const CLOTHING = [
  { jacket: "#2E44C8", shirt: "#F4F6FF" },
  { jacket: "#1F2937", shirt: "#E8EDF5" },
  { jacket: "#0F766E", shirt: "#ECFDF8" },
  { jacket: "#7C3AED", shirt: "#F5F1FF" },
  { jacket: "#9A3412", shirt: "#FFF4EA" },
  { jacket: "#334155", shirt: "#F1F5F9" },
  { jacket: "#166534", shirt: "#F0FDF4" },
] as const

const BACKGROUNDS = [
  { fill: "#EEF1FF", accent: "#C7D0F8" },
  { fill: "#FDF2E5", accent: "#F6D6A8" },
  { fill: "#E7F6EF", accent: "#B4E3CC" },
  { fill: "#F3E8FF", accent: "#DBC5F8" },
  { fill: "#E6F4F9", accent: "#B3DFEE" },
  { fill: "#FCE9EC", accent: "#F5C2CC" },
] as const

type BackgroundShape = "circle" | "ring" | "arch" | "diamond"
const BACKGROUND_SHAPES: readonly BackgroundShape[] = ["circle", "ring", "arch", "diamond"]

type Accessory = "none" | "glasses" | "earrings"

/* ── Shared building blocks ────────────────────────────────────────── */

function BackgroundDecor({ shape, accent }: { shape: BackgroundShape; accent: string }) {
  switch (shape) {
    case "circle":
      return <circle cx="76" cy="22" r="14" fill={accent} opacity="0.7" />
    case "ring":
      return (
        <circle cx="20" cy="24" r="11" fill="none" stroke={accent} strokeWidth="5" opacity="0.8" />
      )
    case "arch":
      return <path d="M60 96 A22 22 0 0 1 96 74 L96 96 Z" fill={accent} opacity="0.7" />
    case "diamond":
      return <rect x="8" y="10" width="18" height="18" rx="4" transform="rotate(45 17 19)" fill={accent} opacity="0.7" />
  }
}

function Face({
  skin,
  accessory,
}: {
  skin: (typeof SKIN_TONES)[number]
  accessory: Accessory
}) {
  return (
    <g>
      {/* Eyes */}
      <circle cx="40" cy="46" r="2.4" fill="#1F2430" />
      <circle cx="56" cy="46" r="2.4" fill="#1F2430" />
      {/* Brows */}
      <path d="M36 40.5 Q40 38.5 44 40.5" stroke="#1F2430" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M52 40.5 Q56 38.5 60 40.5" stroke="#1F2430" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Nose */}
      <path d="M48 48 Q46.6 52.5 48.6 53.5" stroke={skin.shadow} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Confident founder smile */}
      <path d="M42 58 Q48 62.5 54 58" stroke="#1F2430" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {accessory === "glasses" && (
        <g stroke="#2A2F3A" strokeWidth="2" fill="none" opacity="0.9">
          <rect x="33.5" y="41.5" width="12.5" height="9.5" rx="4.2" />
          <rect x="50" y="41.5" width="12.5" height="9.5" rx="4.2" />
          <path d="M46 46 L50 46" />
        </g>
      )}
    </g>
  )
}

/* ── Male avatar ───────────────────────────────────────────────────── */

const MALE_HAIRSTYLES = ["short", "sidePart", "waves", "buzz", "receding"] as const
type MaleHair = (typeof MALE_HAIRSTYLES)[number]

function MaleHairShape({ style, color }: { style: MaleHair; color: string }) {
  switch (style) {
    case "short":
      return <path d="M30 42 Q29 24 48 23 Q67 24 66 42 L63 42 Q62 30 48 30 Q34 30 33 42 Z" fill={color} />
    case "sidePart":
      return <path d="M30 42 Q28 23 50 22 Q68 25 66 42 L62 42 Q62 31 44 30 Q40 34 33 42 Z" fill={color} />
    case "waves":
      return (
        <path
          d="M30 42 Q28 25 48 22 Q68 25 66 42 L62 42 Q63 33 56 32 Q52 35 46 32 Q40 35 34 42 Z"
          fill={color}
        />
      )
    case "buzz":
      return <path d="M31 40 Q31 26 48 25 Q65 26 65 40 L62 40 Q61 31 48 31 Q35 31 34 40 Z" fill={color} opacity="0.92" />
    case "receding":
      return <path d="M31 41 Q32 28 42 26 Q38 32 36 41 Z M65 41 Q64 28 54 26 Q58 32 60 41 Z" fill={color} />
  }
}

function MaleFacialHair({ variant, color }: { variant: number; color: string }) {
  if (variant === 0) return null
  if (variant === 1) {
    // Neat short beard
    return (
      <path
        d="M34 52 Q35 66 48 67 Q61 66 62 52 Q61 62 48 63.5 Q35 62 34 52 Z"
        fill={color}
        opacity="0.85"
      />
    )
  }
  // Mustache
  return <path d="M42.5 54.5 Q48 52.5 53.5 54.5 Q48 56.5 42.5 54.5 Z" fill={color} opacity="0.85" />
}

export function MaleCartoonAvatar({ seed, alt, size = 96, className }: Omit<CartoonAvatarProps, "gender">) {
  const hash = hashSeed(seed)
  const skin = pick(SKIN_TONES, hash, 1)
  const hairColor = pick(HAIR_COLORS, hash, 3)
  const hair = pick(MALE_HAIRSTYLES, hash, 5)
  const clothing = pick(CLOTHING, hash, 7)
  const background = pick(BACKGROUNDS, hash, 9)
  const backgroundShape = pick(BACKGROUND_SHAPES, hash, 11)
  const facialHair = pick([0, 0, 1, 1, 2] as const, hash, 13)
  const accessory: Accessory = pick(["none", "none", "glasses"] as const, hash, 15)
  const hasTie = pick([true, false, false] as const, hash, 17)

  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      role="img"
      aria-label={alt}
      className={cn("shrink-0 rounded-full", className)}
    >
      <title>{alt}</title>
      <clipPath id={`clip-${hash}-m`}>
        <circle cx="48" cy="48" r="48" />
      </clipPath>
      <g clipPath={`url(#clip-${hash}-m)`}>
        <rect width="96" height="96" fill={background.fill} />
        <BackgroundDecor shape={backgroundShape} accent={background.accent} />

        {/* Shoulders / blazer */}
        <path d="M14 96 Q16 74 34 71 L48 78 L62 71 Q80 74 82 96 Z" fill={clothing.jacket} />
        {/* Shirt */}
        <path d="M40 72 L48 80 L56 72 L56 96 L40 96 Z" fill={clothing.shirt} />
        {hasTie && <path d="M46.4 78 L49.6 78 L51 88 L48 92 L45 88 Z" fill={clothing.jacket} opacity="0.75" />}
        {/* Lapels */}
        <path d="M40 72 L48 80 L44 88 L37 76 Z M56 72 L48 80 L52 88 L59 76 Z" fill={clothing.jacket} />

        {/* Neck */}
        <rect x="42.5" y="60" width="11" height="14" rx="4.5" fill={skin.shadow} />
        {/* Head */}
        <ellipse cx="48" cy="46" rx="18.5" ry="19.5" fill={skin.base} />
        {/* Ears */}
        <circle cx="29.5" cy="47" r="3.4" fill={skin.base} />
        <circle cx="66.5" cy="47" r="3.4" fill={skin.base} />

        <MaleFacialHair variant={facialHair} color={hairColor} />
        <Face skin={skin} accessory={accessory} />
        <MaleHairShape style={hair} color={hairColor} />
      </g>
    </svg>
  )
}

/* ── Female avatar ─────────────────────────────────────────────────── */

const FEMALE_HAIRSTYLES = ["long", "bob", "bun", "curly", "headscarf"] as const
type FemaleHair = (typeof FEMALE_HAIRSTYLES)[number]

function FemaleHairShape({ style, color }: { style: FemaleHair; color: string }) {
  switch (style) {
    case "long":
      return (
        <g fill={color}>
          <path d="M27 78 Q23 44 30 33 Q36 21 48 21 Q60 21 66 33 Q73 44 69 78 Q65 80 62 74 L62 44 Q56 32 48 32 Q40 32 34 44 L34 74 Q31 80 27 78 Z" />
        </g>
      )
    case "bob":
      return (
        <path
          d="M28 58 Q25 28 48 22 Q71 28 68 58 Q64 61 62 55 L62 42 Q57 32 48 32 Q39 32 34 42 L34 55 Q32 61 28 58 Z"
          fill={color}
        />
      )
    case "bun":
      return (
        <g fill={color}>
          <circle cx="48" cy="21" r="8" />
          <path d="M30 44 Q29 25 48 24 Q67 25 66 44 L62 44 Q61 32 48 32 Q35 32 34 44 Z" />
        </g>
      )
    case "curly":
      return (
        <g fill={color}>
          <path d="M28 52 Q22 30 40 24 Q48 18 58 24 Q74 30 68 52 Q64 56 62 49 Q62 40 56 34 Q48 38 40 34 Q34 40 34 49 Q32 56 28 52 Z" />
          <circle cx="30" cy="34" r="5" />
          <circle cx="66" cy="34" r="5" />
          <circle cx="38" cy="25" r="5" />
          <circle cx="58" cy="25" r="5" />
        </g>
      )
    case "headscarf":
      return (
        <g fill={color}>
          {/* Modern professional headscarf silhouette */}
          <path d="M48 19 Q70 21 69 47 Q70 62 62 70 Q68 56 64 44 Q62 32 48 31 Q34 32 32 44 Q28 56 34 70 Q26 62 27 47 Q26 21 48 19 Z" />
          <path d="M32 60 Q34 74 44 79 L40 84 Q30 78 29 64 Z" opacity="0.9" />
        </g>
      )
  }
}

export function FemaleCartoonAvatar({ seed, alt, size = 96, className }: Omit<CartoonAvatarProps, "gender">) {
  const hash = hashSeed(seed)
  const skin = pick(SKIN_TONES, hash, 2)
  const hairColor = pick(HAIR_COLORS, hash, 4)
  const hair = pick(FEMALE_HAIRSTYLES, hash, 6)
  const clothing = pick(CLOTHING, hash, 8)
  const background = pick(BACKGROUNDS, hash, 10)
  const backgroundShape = pick(BACKGROUND_SHAPES, hash, 12)
  const accessory: Accessory = pick(["none", "glasses", "earrings", "earrings"] as const, hash, 14)
  const showEarrings = accessory === "earrings" && hair !== "headscarf"

  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      role="img"
      aria-label={alt}
      className={cn("shrink-0 rounded-full", className)}
    >
      <title>{alt}</title>
      <clipPath id={`clip-${hash}-f`}>
        <circle cx="48" cy="48" r="48" />
      </clipPath>
      <g clipPath={`url(#clip-${hash}-f)`}>
        <rect width="96" height="96" fill={background.fill} />
        <BackgroundDecor shape={backgroundShape} accent={background.accent} />

        {/* Shoulders / blazer */}
        <path d="M14 96 Q16 74 34 71 L48 79 L62 71 Q80 74 82 96 Z" fill={clothing.jacket} />
        {/* Blouse */}
        <path d="M40 72 L48 80 L56 72 L56 96 L40 96 Z" fill={clothing.shirt} />
        {/* Lapels */}
        <path d="M40 72 L48 80 L43 87 L37 76 Z M56 72 L48 80 L53 87 L59 76 Z" fill={clothing.jacket} />

        {/* Neck */}
        <rect x="42.5" y="60" width="11" height="14" rx="4.5" fill={skin.shadow} />
        {/* Head */}
        <ellipse cx="48" cy="46" rx="18" ry="19" fill={skin.base} />
        {/* Ears */}
        {hair !== "headscarf" && (
          <g fill={skin.base}>
            <circle cx="30.5" cy="47" r="3.2" />
            <circle cx="65.5" cy="47" r="3.2" />
          </g>
        )}
        {showEarrings && (
          <g fill="#D9A845">
            <circle cx="30.5" cy="51" r="1.8" />
            <circle cx="65.5" cy="51" r="1.8" />
          </g>
        )}

        <Face skin={skin} accessory={accessory === "glasses" ? "glasses" : "none"} />
        <FemaleHairShape style={hair} color={hairColor} />
      </g>
    </svg>
  )
}

/* ── Gender dispatcher ─────────────────────────────────────────────── */

export function CartoonAvatar({ gender, ...props }: CartoonAvatarProps) {
  return gender === "female" ? (
    <FemaleCartoonAvatar {...props} />
  ) : (
    <MaleCartoonAvatar {...props} />
  )
}
