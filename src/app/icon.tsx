import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4dfd4",
        color: "#2f1d14",
        borderRadius: 112,
        fontSize: 250,
        fontWeight: 700,
        letterSpacing: -20,
      }}
    >
      M
    </div>,
    size,
  );
}
