import { publicEnv } from "@/lib/env"
import { getActiveAds } from "@/lib/data/public"
import { cn } from "@/lib/utils"
import type { AdPlacement } from "@/generated/prisma/enums"
import { GoogleAd } from "./GoogleAd"

const reserved: Record<AdPlacement, string> = {
  HEADER_BANNER: "min-h-[100px] md:min-h-[90px]",
  HOME_INLINE: "min-h-[250px] md:min-h-[120px]",
  ARTICLE_TOP: "min-h-[100px]",
  ARTICLE_MIDDLE: "min-h-[280px]",
  ARTICLE_BOTTOM: "min-h-[280px]",
  SIDEBAR: "min-h-[600px]",
  MOBILE_STICKY: "min-h-[60px]",
}

/**
 * Renders nothing unless AdSense is enabled, a publisher id is configured AND
 * an active unit exists for this placement — so no empty boxes appear.
 * The container is only displayed once advertising consent is known
 * (`html[data-consent-ads="1"]`, set pre-paint) to avoid layout shift.
 */
export async function AdSlot({ placement, label, className }: { placement: AdPlacement; label: string; className?: string }) {
  if (!publicEnv.adsenseEnabled || !publicEnv.adsenseClientId) return null
  const ad = (await getActiveAds()).get(placement)
  if (!ad) return null
  return (
    <aside aria-label={label} className={cn("ad-slot hidden w-full", className)}>
      <p className="mb-1.5 text-center text-[0.65rem] tracking-[0.2em] text-fg-subtle uppercase">{label}</p>
      <div className={cn("overflow-hidden", reserved[placement])}>
        <GoogleAd clientId={publicEnv.adsenseClientId} slotId={ad.adSlotId} format={ad.format} responsive={ad.responsive} />
      </div>
    </aside>
  )
}
