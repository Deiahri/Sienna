import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** "SZ" in sienna on the paper. Generated; no image file to keep. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf8f5",
          borderRadius: 14,
          color: "#a0522d",
          fontSize: 32,
          fontStyle: "italic",
          fontFamily: "serif",
          letterSpacing: -1,
        }}
      >
        SZ
      </div>
    ),
    size,
  );
}
