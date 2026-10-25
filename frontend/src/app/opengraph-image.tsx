import { ImageResponse } from "next/og"

export const alt = "Wosool — Founders to Founders"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#0C0C31", color: "white", padding: "72px", justifyContent: "space-between", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", color: "#63E6CE", fontSize: 30, letterSpacing: 8 }}>WOSOOL</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700, letterSpacing: -3 }}>Founders to Founders</div>
        <div style={{ display: "flex", fontSize: 30, color: "#CBD5E1" }}>Connections. Learning. Opportunities.</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #36365A", paddingTop: 26, fontSize: 24 }}>
        <div style={{ display: "flex" }}>Saudi Arabia · GCC · Beyond</div>
        <div style={{ display: "flex", color: "#63E6CE" }}>wosool.org</div>
      </div>
    </div>,
    size,
  )
}
