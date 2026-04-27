// ============================================================
// ROOT LAYOUT
// ------------------------------------------------------------
// This file wraps EVERY page on the website. It sets up:
//   - HTML document structure
//   - Fonts (Playfair Display for headings, Inter for body)
//   - Metadata (title, description shown in browser tab + SEO)
//   - Global CSS
// ============================================================

import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

// Elegant serif for headings — the "wedding" feel
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

// Clean sans-serif for body text
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Metadata shown in the browser tab and search engine results
export const metadata: Metadata = {
  title: "Em & Gid at Quendon",
  description: "Wedding registry for Em and Gid's wedding at Quendon.",
};

// The root component that every page renders inside
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
