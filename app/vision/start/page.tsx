import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import VisionStartFlow from '@/components/vision/VisionStartFlow';

export const metadata: Metadata = {
  title: 'Get a renovation estimate from your photo',
  description: 'Upload a photo of your space, tell us what you want to do, and naili builds a cost estimate, materials list, contractor brief, and design concept in seconds.',
};

type PageProps = {
  searchParams?: {
    from?: string;
    zip?: string;
    category?: string;
    style?: string;
    quality?: string;
    notes?: string;
    image?: string;
  };
};

export default function VisionStartPage({ searchParams }: PageProps) {
  return (
    <main className="min-h-screen bg-canvas">
      <Nav />
      <section className="px-4 pb-16 pt-28 sm:px-6 md:pt-32 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <VisionStartFlow initialPrefill={searchParams} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
