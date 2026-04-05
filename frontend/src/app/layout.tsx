import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wosool — Founders to Founders",
  description:
    "A curated founder network and execution platform connecting visionary entrepreneurs across the Saudi and GCC ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-surface text-primary">
        {children}
      </body>
    </html>
  );
}
