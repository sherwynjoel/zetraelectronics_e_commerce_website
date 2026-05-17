import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CookieConsent } from "@/components/cookie-consent";
import { CartSyncProvider } from "@/components/cart-sync-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zetra Electronics | Premium Electronic Components",
  description: "Your one-stop shop for electronic components, sensors, and robotics at Zetra Electronics.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${outfit.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        {children}
        <CartSyncProvider />
        <CookieConsent />
      </body>
    </html>
  );
}
