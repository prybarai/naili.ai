import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Shell from "@/components/Shell";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
 metadataBase: new URL("https://www.naili.ai"),
 title: "Naili — AI-powered home planning",
 description:
  "Upload a photo of your space. Get AI-powered cost estimates, material lists, design concepts, and contractor briefs — then decide between DIY or hiring a pro.",
 icons: {
  icon: "/favicon.ico",
 },
 openGraph: {
  type: "website",
  siteName: "Naili",
  locale: "en_US",
  title: "Naili — AI-powered home planning",
  description:
   "Upload a photo of your space. Get AI-powered cost estimates, material lists, design concepts, and contractor briefs — then decide between DIY or hiring a pro.",
 },
 twitter: {
  card: "summary_large_image",
  site: "@naili",
  title: "Naili — AI-powered home planning",
  description:
   "Upload a photo of your space. Get AI-powered cost estimates, material lists, design concepts, and contractor briefs — then decide between DIY or hiring a pro.",
 },
 other: {
  "google-site-verification": process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
 },
};

export const viewport: Viewport = {
 themeColor: "#F6F3EE",
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <html lang="en">
   <body className="relative min-h-screen overflow-x-hidden">
    <AuthProvider>
     <Shell>
      {children}
     </Shell>
    </AuthProvider>
    <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
   </body>
  </html>
 );
}
