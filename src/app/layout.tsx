import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "bulletinAI — Multi-Channel Newsletter Platform",
  description: "WhatsApp + Email bülten platformu",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
