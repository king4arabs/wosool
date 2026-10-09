import Image from 'next/image'
/** Frame the supplied artwork to its visible bounds without changing its pixels. */
export function EoaLogo({
  inverse = false,
  className = '',
  priority = false,
}: {
  inverse?: boolean
  className?: string
  priority?: boolean
}) {
  return (
    <span className={`eoa-logo ${className}`} data-inverse={inverse}>
      <Image
        src={
          inverse
            ? '/partners/eo-riyadh-inverse.png'
            : '/partners/eo-riyadh.png'
        }
        alt="EO Riyadh"
        width={6666}
        height={3201}
        priority={priority}
        unoptimized
      />
    </span>
  )
}
