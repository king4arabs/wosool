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
            ? '/partners/eo-riyadh-supplied.png'
            : '/partners/eo-riyadh.png'
        }
        alt="EO Riyadh"
        width={inverse ? 375 : 6666}
        height={inverse ? 134 : 3201}
        sizes={inverse ? '(max-width: 600px) 160px, 200px' : '(max-width: 600px) 140px, 180px'}
        priority={priority}
        unoptimized={inverse}
      />
    </span>
  )
}
