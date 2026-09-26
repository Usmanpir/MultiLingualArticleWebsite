import Image from "next/image"
import { brandConfig } from "@/lib/brand"
import { cn } from "@/lib/utils"

export function LogoMark({ className, gradientId = "fs-g" }: { className?: string; gradientId?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="9" fill="none" stroke={`url(#${gradientId})`} strokeWidth="2.4" />
      <ellipse cx="16" cy="16" rx="14.5" ry="5.2" fill="none" stroke={`url(#${gradientId})`} strokeWidth="1.4" opacity=".8" transform="rotate(-24 16 16)" />
      <circle cx="26.6" cy="10.6" r="1.8" fill="var(--accent)" />
    </svg>
  )
}

export function Logo({ name, className, gradientId }: { name: string; className?: string; gradientId?: string }) {
  if (brandConfig.logo.image) {
    return <Image src={brandConfig.logo.image} alt={brandConfig.logo.alt} width={160} height={32} className={cn("h-8 w-auto", className)} loading="eager" />
  }
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark gradientId={gradientId} />
      <span className="font-[family-name:var(--font-grotesk)] text-lg font-bold tracking-tight" dir="ltr">
        {name}
      </span>
    </span>
  )
}
