import { Metadata } from 'next';
import Link from 'next/link';
import { TOP_50_CITIES } from '@/lib/cities/cityData';

export const metadata: Metadata = {
  title: 'Renovation Cost Guides by City | Local Pricing & Contractor Tips | Naili',
  description: 'Find localized renovation costs for the top 50 US cities. Get city-specific pricing for kitchen remodels, bathroom remodels, roofing, decks, painting, and more. Permit info, climate factors, and contractor tips included.',
  openGraph: {
    title: 'Renovation Cost Guides by City | Naili',
    description: 'Find localized renovation costs for the top 50 US cities with city-specific pricing, permit info, and contractor tips.',
    url: 'https://www.naili.ai/cities',
    siteName: 'Naili',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Renovation Cost Guides by City | Naili',
    description: 'Find localized renovation costs for the top 50 US cities with city-specific pricing, permit info, and contractor tips.',
  },
  alternates: {
    canonical: 'https://www.naili.ai/cities',
  },
};

const regionColors: Record<string, string> = {
  Northeast: 'bg-blue-50 border-blue-100 text-blue-700',
  Midwest: 'bg-green-50 border-green-100 text-green-700',
  South: 'bg-amber-50 border-amber-100 text-amber-700',
  West: 'bg-orange-50 border-orange-100 text-orange-700',
  Pacific: 'bg-purple-50 border-purple-100 text-purple-700',
};

const regionEmoji: Record<string, string> = {
  Northeast: '🏙️', Midwest: '🌽', South: '🌲', West: '🏔️', Pacific: '🌊',
};

export default function CitiesIndexPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Renovation Cost Guides by City',
    description: 'Localized renovation cost guides for the top 50 US cities.',
    url: 'https://www.naili.ai/cities',
  };

  const regions = ['Northeast', 'Midwest', 'South', 'West', 'Pacific'];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="animate-reveal-up">
          <span className="nl-eyebrow">City Guides</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
            Renovation Costs by{' '}
            <span className="nl-gradient-text">City</span>
          </h1>
          <p className="text-lg text-ink-600 max-w-3xl mb-10">
            Every city has its own renovation market. Find localized pricing, permit requirements, 
            climate considerations, and contractor tips for your city.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-amber-50 to-sand-light/30 rounded-[1.5rem] p-6 md:p-8 mb-12 border border-sand/20 animate-reveal-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-ink">Need a personalized estimate?</h2>
              <p className="text-ink-600">Upload a photo and get scope, materials, and pricing for your specific project.</p>
            </div>
            <Link href="/" className="nl-pill shrink-0">Start your estimate →</Link>
          </div>
        </div>

        {/* Cities Grid by Region */}
        {regions.map((region) => {
          const cities = TOP_50_CITIES.filter((c) => c.region === region).sort((a, b) => b.population - a.population);
          return (
            <div key={region} className="mb-10 animate-reveal-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                {regionEmoji[region]} {region}
              </h2>
              <p className="text-ink-500 text-sm mb-4">
                {cities.length} cities · Cost index range: {Math.min(...cities.map(c => c.costIndex)).toFixed(2)}x – {Math.max(...cities.map(c => c.costIndex)).toFixed(2)}x
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/cities/${city.slug}`}
                    className="nl-card group hover:border-sand-200 transition-all flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg group-hover:text-sand-dark transition-colors">
                        {city.name}, {city.stateAbbr}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${regionColors[region]}`}>
                        {city.costIndex.toFixed(2)}x
                      </span>
                    </div>
                    <p className="text-xs text-ink-400 mb-2">
                      Pop. {city.population.toLocaleString()} · {city.medianHomeValue} median
                    </p>
                    <p className="text-sm text-ink-600 leading-relaxed line-clamp-2">
                      {city.description.slice(0, 140)}...
                    </p>
                    {city.featuredGuides.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {city.featuredGuides.map((g) => (
                          <span key={g} className="text-xs bg-sand-light/30 text-ink-500 px-2 py-0.5 rounded-full">
                            {g.replace(/-/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
