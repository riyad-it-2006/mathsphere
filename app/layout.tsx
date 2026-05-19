import React from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/src/index.css";
import { Providers } from "@/src/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "GBC Academic Hub",
  description: "Academic companion for Govt. Bhola College students",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#050505] text-gray-200 antialiased font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
