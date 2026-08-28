import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#11120F",
          color: "#F5F3EC",
          padding: 72,
        }}
      >
        <div style={{ fontSize: 28, color: "#C7FF35" }}>São Vicente, Madeira · 1,300 m²</div>
        <div style={{ fontSize: 72, fontWeight: 600, lineHeight: 1.05 }}>
          Your brand. On my land.
        </div>
        <div style={{ fontSize: 28 }}>Brand My Land · 85 placements · 30-day auction</div>
      </div>
    ),
    size,
  );
}
