import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wosool — Supporting Saudi Entrepreneurs | Founder to Founders",
  description:
    "Wosool empowers Saudi entrepreneurs to build successful and sustainable businesses through resources, mentorship, and strategic partnerships. Founder to Founders.",
  openGraph: {
    title: "Wosool — Supporting Saudi Entrepreneurs | Founder to Founders",
    description:
      "Empowering Saudi entrepreneurs to build successful and sustainable businesses while fostering an innovation-driven culture.",
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
