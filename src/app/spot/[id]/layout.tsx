import type { Metadata } from "next";
import { PLACEMENT_DEFINITIONS } from "@/lib/auction/inventory";
import { formatEuroFromCents } from "@/lib/auction/money";
import { siteUrl } from "@/lib/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const def = PLACEMENT_DEFINITIONS.find((p) => p.id === id);
  if (!def) return { title: "Placement" };
  const title = `${def.id} · ${def.name}`;
  const description = `${def.sizeLabel} ${def.type} on Brand My Land. Opening bid ${formatEuroFromCents(def.minBidCents)}. Physical installation is subject to approval.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl()}/spot/${id}`,
    },
  };
}

export default function SpotLayout({ children }: { children: React.ReactNode }) {
  return children;
}
