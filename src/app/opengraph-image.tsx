import { ImageResponse } from "next/og";
import { fullName, site } from "@/site.config";

export const alt = fullName;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The share card: the hero, on the paper. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "#faf8f5",
          color: "#1c1a17",
        }}
      >
        <div style={{ display: "flex", fontSize: 120, fontStyle: "italic", fontFamily: "serif" }}>{fullName}</div>
        <div style={{ display: "flex", fontSize: 40, color: "#4a4640" }}>{site.title}</div>
        <div style={{ display: "flex", width: 80, height: 3, background: "#a0522d", marginTop: 12 }} />
      </div>
    ),
    size,
  );
}
