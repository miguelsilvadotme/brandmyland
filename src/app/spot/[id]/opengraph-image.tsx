import { ImageResponse } from "next/og";
import { PLACEMENT_DEFINITIONS } from "@/lib/auction/inventory";
import { formatEuroFromCents } from "@/lib/auction/money";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function SpotOg({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const def = PLACEMENT_DEFINITIONS.find((p) => p.id === id);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#F5F3EC",
          color: "#11120F",
          padding: 72,
        }}
      >
        <div style={{ fontSize: 24, color: "#5c5a52" }}>Brand My Land</div>
        <div style={{ fontSize: 64, fontWeight: 650, marginTop: 16 }}>
          {def?.id ?? id}
        </div>
        <div style={{ fontSize: 32, marginTop: 12 }}>{def?.name}</div>
        <div style={{ fontSize: 28, marginTop: 24 }}>
          {def ? `${def.sizeLabel} · from ${formatEuroFromCents(def.minBidCents)}` : ""}
        </div>
      </div>
    ),
    size,
  );
}
