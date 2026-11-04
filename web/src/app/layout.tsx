import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthBootstrap } from "@/ui/AuthBootstrap";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ruven — Connect · Collaborate · Launch",
    template: "%s | Ruven",
  },
  description:
    "Ruven is the networking and collaboration platform for the Indian startup ecosystem. Connect with founders, investors, and talent.",
  keywords: ["startup", "founder", "india", "investor", "networking", "collaboration", "ruven"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://ruven.in"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Ruven",
    title: "Ruven — Connect · Collaborate · Launch",
    description: "The networking & collaboration platform for the Indian startup ecosystem.",
  },
  twitter: {
    card: "summary_large_image",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ruven",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className={jakarta.variable} data-scroll-behavior="smooth">
      <body className="antialiased bg-[#000] text-white">
        <AuthBootstrap />
        {children}
      </body>
    </html>
  );
}
