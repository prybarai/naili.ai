import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import UploadStage from "@/components/UploadStage";
import Showcase from "@/components/Showcase";
import TrustBand from "@/components/TrustBand";
import AddictiveFlow from "@/components/AddictiveFlow";

export default function HomePage() {
  return (
    <main className="relative z-10">
      <Nav />
      {/* Dark: Full-bleed hero with photography */}
      <Hero />
      {/* Dark: Stats band */}
      <TrustBand />
      {/* Light: How it works */}
      <AddictiveFlow />
      {/* Light: Upload your space */}
      <UploadStage />
      {/* Dark: Recent projects showcase */}
      <Showcase />
      {/* Dark: Footer */}
      <Footer />
    </main>
  );
}
