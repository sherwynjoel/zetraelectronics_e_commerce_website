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
  metadataBase: new URL("https://zetraelectronics.com"),
  title: {
    default: "Zetra Electronics | Premium Electronic Components India",
    template: "%s | Zetra Electronics",
  },
  description: "Buy electronic components, sensors, IoT modules, development boards, and robotics kits online in India. Fast shipping, enterprise-grade quality at Zetra Electronics.",
  keywords: [
    "electronic components India", "buy sensors online", "Arduino modules", "Raspberry Pi India",
    "IoT modules", "robotics kits", "development boards", "electronic parts online India",
    "buy electronics online", "Zetra Electronics"
  ],
  authors: [{ name: "Zetra Electronics", url: "https://zetraelectronics.com" }],
  creator: "Zetra Electronics",
  publisher: "Zetra Electronics",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://zetraelectronics.com",
    siteName: "Zetra Electronics",
    title: "Zetra Electronics | Premium Electronic Components India",
    description: "Buy electronic components, sensors, IoT modules, development boards, and robotics kits online in India.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Zetra Electronics" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zetra Electronics | Premium Electronic Components India",
    description: "Buy electronic components, sensors, IoT modules, and robotics kits online in India.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://zetraelectronics.com",
  },
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
