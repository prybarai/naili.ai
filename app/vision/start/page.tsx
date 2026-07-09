import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import VisionStartFlow from '@/components/vision/VisionStartFlow';

export const metadata: Metadata = {
  title: 'Get a renovation estimate from your photo',
  description:
    'Upload a photo of your space, tell us what you want to do, and naili builds a cost estimate, materials list, contractor brief, and design concept in seconds.',
};

type PageProps = {
  searchParams?: Promise<{
    from?: string;
    zip?: string;
    category?: string;
    style?: string;
    quality?: string;
    notes?: string;
    image?: string;
  }>;
};

export default async function VisionStartPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  return (
    <main className="min-h-screen bg-canvas">
      <Nav />
      <section className="px-4 pb-16 pt-28 sm:px-6 md:pt-32 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <ErrorBoundary>
            <VisionStartFlow initialPrefill={params} />
          </ErrorBoundary>
        </div>
      </section>
      <Footer />
    </main>
  );
}
