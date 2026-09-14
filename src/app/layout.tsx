import ComparisonBar from "@/components/ComparisonBar";
import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  verification: {
    google: "TASj_Z-u2uVfQtFJL-VZQnQB6uwfrCYMR6VhbXBuTLE",
  },

  title: {
    default:
      "Guia Tech | Tecnologia, Ofertas e Análises",
    template: "%s | Guia Tech",
  },

  description:
    "Encontre ofertas, análises, comparativos e recomendações de smartphones, notebooks, Smart TVs, games e tecnologia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}

        <ComparisonBar />
      </body>
    </html>
  );
}