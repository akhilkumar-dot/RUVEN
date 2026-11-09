import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthBootstrap } from "@/ui/AuthBootstrap";
import { NotificationProvider } from "@/ui/NotificationProvider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "COLLAB — Connect · Collaborate · Launch",
    template: "%s | COLLAB",
  },
  description:
    "COLLAB is the networking and collaboration platform for the Indian startup ecosystem. Connect with founders, investors, and talent.",
  keywords: ["startup", "founder", "india", "investor", "networking", "collaboration", "collab"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://collabapp.in"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "COLLAB",
    title: "COLLAB — Connect · Collaborate · Launch",
    description: "The networking & collaboration platform for the Indian startup ecosystem.",
  },
  twitter: {
    card: "summary_large_image",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "COLLAB",
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
      <head>
        {/* Apply saved theme before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('collab_theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased bg-[#000] text-white">
        <div className="desktop-bg" aria-hidden="true" />
        <div className="mobile-pov-container">
          <AuthBootstrap />
          <NotificationProvider />
          {children}
        </div>
      </body>
    </html>
  );
}
