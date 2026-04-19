// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ROLU — Empowering Communities",
  description: "Volunteer or donate to help ROLU empower communities across Ghana through education, healthcare, and economic development.",
  keywords: ["NGO", "Ghana", "volunteer", "donate", "community", "ROLU"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Paystack inline JS — loaded globally */}
        <script src="https://js.paystack.co/v1/inline.js" async />
      </head>
      <body>{children}</body>
    </html>
  );
}
