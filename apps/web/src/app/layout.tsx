import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartSyncProvider } from "@/components/cart-sync-provider";
import { ThemeScript } from "@/components/ui/theme-script";
import { AmbientField } from "@/components/layout/ambient-field";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zetraelectronics.com"),
  title: {
    default: "Zetra Electronics | Premium Electronic Components India",
    template: "%s | Zetra Electronics",
  },
  description:
    "Buy electronic components, sensors, IoT modules, development boards, and robotics kits online in India. Fast shipping, enterprise-grade quality at Zetra Electronics.",
  keywords: [
    "electronic components India",
    "buy sensors online",
    "Arduino modules",
    "Raspberry Pi India",
    "IoT modules",
    "robotics kits",
    "development boards",
    "electronic parts online India",
    "buy electronics online",
    "Zetra Electronics",
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
    description:
      "Buy electronic components, sensors, IoT modules, development boards, and robotics kits online in India.",
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eaf0fa" },
    { media: "(prefers-color-scheme: dark)", color: "#050a16" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${hanken.variable} ${jetbrains.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased">
        <AmbientField />
        {children}
        <CartSyncProvider />
      </body>
    </html>
  );
}
