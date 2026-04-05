import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wosool — Founders to Founders",
  description:
    "Wosool is a premium founders-to-founders network for ambitious entrepreneurs building in Saudi Arabia and the GCC. Apply to join a trusted community of verified founders.",
  openGraph: {
    title: "Wosool — Founders to Founders",
    description:
      "A premium founders-to-founders network for ambitious entrepreneurs in Saudi Arabia and the GCC.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
