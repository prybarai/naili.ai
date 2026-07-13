"use client";

import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Full-screen pages that get their own layout (results page, privacy, calculators)
  const isFullScreen = pathname?.startsWith("/vision/results/");
  const isVisionStart = pathname?.startsWith("/vision/start");
  const isVisionDemo = pathname?.startsWith("/vision/demo");
  const isVisionUnified = pathname?.startsWith("/vision/unified");

  // Vision sub-pages are minimal — just nav, no footer canvas clutter
  const isVisionPage = pathname?.startsWith("/vision") && !isFullScreen;

  if (isFullScreen) {
    return <>{children}</>;
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen">
        {children}
      </main>
      {!isVisionPage && !isVisionStart && !isVisionDemo && !isVisionUnified && <Footer />}
    </>
  );
}
