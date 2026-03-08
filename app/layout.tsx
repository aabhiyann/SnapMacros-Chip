import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { PwaRegister } from "@/components/PwaRegister";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { cn } from "@/lib/utils";



const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://snapmacros.vercel.app"),
  title: "SnapMacros",
  description: "AI nutrition tracker — photograph food, get instant macro breakdown. Chip is your mascot.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SnapMacros",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "SnapMacros — Snap your food. Know your macros.",
    description: "AI nutrition tracking with Chip, your hatching egg mascot.",
    url: "/",
    siteName: "SnapMacros",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SnapMacros — Snap your food. Know your macros.",
    description: "AI nutrition tracking with Chip, your hatching egg mascot.",
    images: ["/og-image.png"],
  },
};

export const viewport = {
  themeColor: "#3B8BF7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(bricolage.variable, dmSans.variable, "font-sans")}>
      <body className="font-body antialiased bg-bg text-text">
        <PwaRegister />
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
