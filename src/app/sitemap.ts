import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";
import { PLACEMENT_DEFINITIONS } from "@/lib/auction/inventory";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/terms` },
    { url: `${base}/privacy` },
    { url: `${base}/refund-policy` },
    ...PLACEMENT_DEFINITIONS.map((p) => ({
      url: `${base}/spot/${p.id}`,
      changeFrequency: "hourly" as const,
    })),
  ];
}
