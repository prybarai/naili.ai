import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TOP_50_CITIES } from '@/lib/cities/cityData';
import { COST_GUIDE_MAP } from '@/lib/costGuides';

interface CityPageProps {
  params: { slug: string };
}

// Category-specific pricing for cities (multiplied by costIndex base)
const CITY_CATEGORY_PRICES: Record<string, { low: number; mid: number; high: number }> = {
  'kitchen-remodel-cost': { low: 15000, mid: 35000, high: 70000 },
  'bathroom-remodel-cost': { low: 8000, mid: 18000, high: 35000 },
  'interior-painting-cost': { low: 2000, mid: 5000, high: 10000 },
  'deck-build-cost': { low: 5000, mid: 12000, high: 25000 },
  'roof-replacement-cost': { low: 7000, mid: 12000, high: 22000 },
};

function getCategoryName(slug: string): string {
  const names: Record<string, string> = {
    'kitchen-remodel-cost': 'kitchen remodel',
    'bathroom-remodel-cost': 'bathroom remodel',
    'interior-painting-cost': 'interior painting',
    'deck-build-cost': 'deck building',
    'roof-replacement-cost': 'roof replacement',
  };
  return names[slug] || slug.replace(/-/g, ' ');
}

export function generateStaticParams() {
  return TOP_50_CITIES.map((city) => ({ slug: city.slug }));
}

export function generateMetadata({ params }: CityPageProps): Metadata {
  const city = TOP_50_CITIES.find((c) => c.slug === params.slug);
  if (!city) return {};

  const costLabel = city.costIndex >= 1.5 ? 'higher-than-average' : city.costIndex >= 1.1 ? 'slightly above average' : 'affordable';
  const title = `Renovation Costs in ${city.name}, ${city.stateAbbr} | Local Pricing & Contractor Guide | Naili`;
  const description = `Looking for renovation costs in ${city.name}, ${city.stateAbbr}? Get localized pricing for kitchen remodels, bathroom remodels, roofing, and more. ${city.permitAuthority} permit info, climate considerations, and trusted contractor tips for ${city.name} homeowners.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.naili.ai/cities/${city.slug}`,
      siteName: 'Naili',
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://www.naili.ai/cities/${city.slug}`,
    },
  };
}

export default function CityPage({ params }: CityPageProps) {
  const city = TOP_50_CITIES.find((c) => c.slug === params.slug);
  if (!city) notFound();

  const regionEmoji: Record<string, string> = {
    Northeast: '🏙️',
    Midwest: '🌽',
    South: '🌲',
    West: '🏔️',
    Pacific: '🌊',
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Renovation Costs in ${city.name}, ${city.stateAbbr}`,
    description: `Local renovation pricing, permit requirements, and contractor guidance for ${city.name}, ${city.state}`,
    author: { '@type': 'Organization', name: 'Naili' },
    publisher: { '@type': 'Organization', name: 'Naili', logo: { '@type': 'ImageObject', url: 'https://www.naili.ai/logo.png' } },
    datePublished: '2026-04-17',
    dateModified: '2026-07-13',
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://www.naili.ai/cities/${city.slug}` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-cream-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="animate-reveal-up">
            <span className="nl-eyebrow">
              {regionEmoji[city.region]} {city.region} — {city.stateAbbr}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-4 leading-tight">
              Renovation Costs in{' '}
              <span className="nl-gradient-text">{city.name}</span>
            </h1>
            <p className="text-lg md:text-xl text-ink-600 max-w-3xl mt-6 leading-relaxed">
              {city.description}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 animate-reveal-up" style={{ animationDelay: '0.2s' }}>
            <div className="nl-stat">
              <span className="nl-gradient-text text-3xl font-bold">{city.costIndex.toFixed(2)}x</span>
              <span className="text-sm text-ink-500 mt-1">Cost Index</span>
            </div>
            <div className="nl-stat">
              <span className="nl-gradient-text text-3xl font-bold">{city.medianHomeValue}</span>
              <span className="text-sm text-ink-500 mt-1">Median Home Value</span>
            </div>
            <div className="nl-stat">
              <span className="nl-gradient-text text-3xl font-bold">{city.typicalSqft}</span>
              <span className="text-sm text-ink-500 mt-1">Typical Sq Ft</span>
            </div>
            <div className="nl-stat">
              <span className="nl-gradient-text text-3xl font-bold">{city.population.toLocaleString()}</span>
              <span className="text-sm text-ink-500 mt-1">Population</span>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <nav className="max-w-6xl mx-auto px-4 py-4 text-sm text-ink-400" aria-label="Breadcrumb">
        <ol className="flex gap-2">
          <li><Link href="/" className="hover:text-ink-600 transition-colors">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><span className="text-ink-700 font-medium">{city.name} Renovation Guide</span></li>
        </ol>
      </nav>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left column - Main article */}
          <div className="md:col-span-2 space-y-10">
            {/* Why Renovation Costs Vary Here */}
            <div className="nl-card">
              <h2 className="text-2xl font-bold mb-4">Why Renovation Costs in {city.name} Are What They Are</h2>
              <div className="space-y-4 text-ink-600 leading-relaxed">
                <p>
                  Renovation costs in {city.name} reflect a combination of local labor rates, material availability, 
                  climate conditions, and permitting complexity. With a cost index of {city.costIndex.toFixed(2)}x 
                  the national average, projects here tend to run{' '}
                  {city.costIndex > 1.2 ? 'higher than many other US metros' : 
                   city.costIndex > 0.95 ? 'close to the national baseline' : 
                   'more affordably than the national average'}.
                </p>
                <h3 className="text-lg font-semibold text-ink-800 mt-6">Cost Drivers Unique to {city.name}</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Permitting complexity:</strong> {city.permitAuthority} oversees all construction permits, and the process{' '}
                    {city.region === 'Northeast' ? 'can be thorough and time-consuming, especially for older buildings with historical considerations.' :
                     city.region === 'Pacific' ? 'includes environmental and seismic review requirements that can add weeks to project timelines.' :
                     city.region === 'West' ? 'varies by municipality but energy efficiency and water conservation requirements are increasingly important.' :
                     'sets clear requirements for structural work, electrical, plumbing, and additions.'}
                  </li>
                  <li><strong>Climate considerations:</strong> {city.climateZones.slice(0, 2).join(' and ')} conditions mean that{' '}
                    {city.region === 'Northeast' || city.region === 'Midwest' ? 'outdoor work has a compressed season from spring through fall, and insulation, heating, and window efficiency are major renovation priorities.' :
                     city.region === 'South' ? 'HVAC efficiency, moisture control, and storm resilience are critical renovation considerations.' :
                     'construction can happen year-round, but cooling efficiency and heat mitigation are key planning factors.'}
                  </li>
                  <li><strong>Housing stock:</strong> With a mix of {city.commonArchitecturalStyles.slice(0, 3).join(', ')}, 
                    {' '}renovation approaches vary significantly. {city.medianHomeValue === '$105,000' ? 'Many older homes need full mechanical upgrades alongside cosmetic improvements.' :
                     parseInt(city.medianHomeValue.replace(/[$,]/g, '')) > 600000 ? 'High property values mean homeowners often invest proportionally more in quality finishes.' :
                     'The variety creates opportunities for different budget levels and project scopes.'}
                  </li>
                </ul>
              </div>
            </div>

            {/* Permit Guide */}
            <div className="nl-card">
              <h2 className="text-2xl font-bold mb-4">Permits and Regulations in {city.name}</h2>
              <div className="space-y-4 text-ink-600 leading-relaxed">
                <p>
                  The <strong>{city.permitAuthority}</strong> manages building permits for {city.name}. 
                  Most structural, electrical, mechanical, and plumbing work requires a permit. Here's what {city.name} homeowners should know:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Permit fees in {city.name} typically range from $200 to $1,500 depending on project scope</li>
                  <li>Plan review times can vary from 2 to 6 weeks for major remodels</li>
                  <li>Contractors working in {city.name} must be licensed and registered with the city</li>
                  <li>
                    {city.region === 'Northeast' ? 'Historic district approvals may be required for exterior work in older neighborhoods.' :
                     city.region === 'Pacific' ? 'Environmental review, coastal commission approval, or seismic documentation may apply.' :
                     'Energy code compliance documentation is typically required for permit approval.'}
                  </li>
                </ul>
                <div className="mt-4">
                  <a
                    href={city.permitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nl-pill inline-flex items-center gap-2"
                  >
                    Visit {city.permitAuthority} website →
                  </a>
                </div>
              </div>
            </div>

            {/* Project Cost Tables */}
            <div className="nl-card">
              <h2 className="text-2xl font-bold mb-4">
                Estimated Renovation Costs in {city.name}
              </h2>
              <p className="text-ink-600 mb-6">
                The table below shows planning-range estimates for common renovation projects in {city.name}, 
                adjusted for local cost index ({city.costIndex.toFixed(2)}x national average).
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-200">
                      <th className="text-left py-3 font-semibold text-ink-700">Project</th>
                      <th className="text-right py-3 font-semibold text-ink-700">Budget</th>
                      <th className="text-right py-3 font-semibold text-ink-700">Mid-Range</th>
                      <th className="text-right py-3 font-semibold text-ink-700">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(CITY_CATEGORY_PRICES).map(([slug, prices]) => {
                      const adj = (val: number) => `$${Math.round(val * city.costIndex / 500) * 500}`;
                      return (
                        <tr key={slug} className="border-b border-ink-100 hover:bg-cream-50 transition-colors">
                          <td className="py-3 text-ink-700 capitalize">
                            <Link href={`/blog/${slug}`} className="hover:text-sand-dark underline underline-offset-2">
                              {getCategoryName(slug)}
                            </Link>
                          </td>
                          <td className="py-3 text-right text-ink-700 font-medium">{adj(prices.low)}</td>
                          <td className="py-3 text-right text-ink-700 font-medium">{adj(prices.mid)}</td>
                          <td className="py-3 text-right text-ink-700 font-medium">{adj(prices.high)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-ink-400 mt-4">
                Estimates are planning ranges based on local cost index adjustment. Actual project costs vary by scope, 
                material choices, and contractor. Get a personalized estimate with Naili.
              </p>
            </div>

            {/* Contractor Tips */}
            <div className="nl-card">
              <h2 className="text-2xl font-bold mb-4">Hiring a Contractor in {city.name}</h2>
              <div className="space-y-4 text-ink-600 leading-relaxed">
                <p>
                  {city.name} has{' '}
                  {city.population > 2000000 ? 'a large and diverse contractor market, from independent tradespeople to large remodeling firms.' :
                   city.population > 1000000 ? 'a healthy contractor market with a mix of established firms and independent specialists.' :
                   'a growing contractor market, with many skilled professionals serving the metro area.'}
                  {' '}Here's how to find the right fit:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Check licensing:</strong> Verify that contractors are licensed with {city.permitAuthority}</li>
                  <li><strong>Get multiple bids:</strong> 3 detailed quotes minimum for major projects</li>
                  <li><strong>Ask about permits:</strong> A reputable contractor handles permitting as part of the process</li>
                  <li><strong>Review insurance:</strong> General liability and workers' compensation coverage are essential</li>
                  <li><strong>Check references:</strong> Recent {city.name} projects similar to yours</li>
                </ul>
                <div className="mt-4 p-4 bg-sand-50 rounded-xl border border-sand-100">
                  <p className="font-semibold text-ink-800 mb-1">Ready for a real estimate?</p>
                  <p className="text-ink-600 text-sm mb-3">
                    Upload a photo of your {city.name} home, tell us what you want to do, and Naili will build 
                    a project brief with scope, materials, and market-accurate pricing.
                  </p>
                  <Link href="/" className="nl-pill inline-flex items-center gap-2">
                    Start your estimate →
                  </Link>
                </div>
              </div>
            </div>

            {/* Architecture & Style Notes */}
            <div className="nl-card">
              <h2 className="text-2xl font-bold mb-4">{city.name} Architecture and Renovation Style Guide</h2>
              <div className="space-y-4 text-ink-600 leading-relaxed">
                <p>
                  {city.name} is known for its {city.commonArchitecturalStyles.slice(0, 3).join(', ')} architecture. 
                  Each style brings different considerations for renovation:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  {city.commonArchitecturalStyles.slice(0, 4).map((style) => (
                    <li key={style}>
                      <strong>{style}:</strong>{' '}
                      {style.includes('Victorian') || style.includes('Pre-war') || style.includes('Brownstone') || style.includes('Rowhome') ?
                        'Often features intricate trim, period details, and older mechanical systems that require careful preservation work.' :
                       style.includes('Mid-century') || style.includes('Eichler') || style.includes('Ranch') ?
                        'Typically has open floor plans, large windows, and slab foundations. Energy upgrades and seismic retrofitting are common needs.' :
                       style.includes('Spanish') || style.includes('Pueblo') || style.includes('Mission') ?
                        'Characterized by stucco, tile, and arch details. Roof and window replacement requires matching specialty materials.' :
                       style.includes('Craftsman') || style.includes('Bungalow') ?
                        'Known for woodwork, built-ins, and front porches. Renovations often focus on kitchen and bath updates while preserving original character.' :
                       style.includes('Contemporary') || style.includes('Modern') ?
                        'Clean lines and efficient layouts. Renovations typically focus on finish upgrades and smart home integration.' :
                        'Widely available with good bones for most renovation approaches.'}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="space-y-6">
            {/* Quick Facts */}
            <div className="nl-card">
              <h3 className="font-bold text-lg mb-3">{city.name} Quick Facts</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-500">Population</span>
                  <span className="font-medium">{city.population.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-ink-100 pt-2">
                  <span className="text-ink-500">Median Home Value</span>
                  <span className="font-medium">{city.medianHomeValue}</span>
                </div>
                <div className="flex justify-between border-t border-ink-100 pt-2">
                  <span className="text-ink-500">Typical Sq Ft</span>
                  <span className="font-medium">{city.typicalSqft}</span>
                </div>
                <div className="flex justify-between border-t border-ink-100 pt-2">
                  <span className="text-ink-500">Cost Index</span>
                  <span className="font-medium">{city.costIndex.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between border-t border-ink-100 pt-2">
                  <span className="text-ink-500">Permit Authority</span>
                  <span className="font-medium text-right text-xs leading-tight max-w-[180px]">{city.permitAuthority}</span>
                </div>
                <div className="flex justify-between border-t border-ink-100 pt-2">
                  <span className="text-ink-500">Region</span>
                  <span className="font-medium">{city.region}</span>
                </div>
              </div>
            </div>

            {/* Climate */}
            <div className="nl-card">
              <h3 className="font-bold text-lg mb-3">Climate Zones</h3>
              <div className="flex flex-wrap gap-2">
                {city.climateZones.map((zone) => (
                  <span key={zone} className="text-xs bg-sand-50 text-ink-600 px-3 py-1.5 rounded-full border border-sand-100">
                    {zone}
                  </span>
                ))}
              </div>
              <p className="text-xs text-ink-400 mt-3">
                Climate impacts renovation timing, material choices, and hidden costs like moisture, 
                freeze-thaw, or heat exposure.
              </p>
            </div>

            {/* Common Architectural Styles */}
            <div className="nl-card">
              <h3 className="font-bold text-lg mb-3">Popular Architectural Styles</h3>
              <ul className="space-y-1">
                {city.commonArchitecturalStyles.map((style) => (
                  <li key={style} className="text-sm text-ink-600 py-1 border-b border-ink-100 last:border-0">
                    {style}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="nl-card bg-gradient-to-br from-amber-50 to-cream-50 border-amber-100">
              <h3 className="font-bold text-lg mb-2">Get a Real Estimate</h3>
              <p className="text-sm text-ink-600 mb-4">
                Upload a photo and get a personalized estimate with scope, materials, and market-accurate 
                pricing for your {city.name} project.
              </p>
              <Link href="/" className="nl-pill w-full text-center block">
                Start now →
              </Link>
            </div>

            {/* Related Guides */}
            {city.featuredGuides.length > 0 && (
              <div className="nl-card">
                <h3 className="font-bold text-lg mb-3">Related Cost Guides</h3>
                <ul className="space-y-2">
                  {city.featuredGuides.map((slug) => {
                    const guide = COST_GUIDE_MAP[slug];
                    if (!guide) return null;
                    return (
                      <li key={slug}>
                        <Link
                          href={`/blog/${slug}`}
                          className="block p-3 rounded-xl hover:bg-cream-50 transition-colors border border-ink-100 hover:border-sand-100"
                        >
                          <span className="font-medium text-sm text-ink-700">{guide.title}</span>
                          <span className="text-xs text-ink-400 block mt-1">{guide.description.slice(0, 80)}...</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* City SEO Text Section */}
      <section className="bg-sand-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="nl-card bg-white">
            <h2 className="text-xl font-bold mb-4">Planning a Renovation in {city.name}?</h2>
            <div className="text-ink-600 leading-relaxed space-y-3 max-w-3xl">
              <p>
                Whether you're planning a kitchen remodel, bathroom update, new deck, roof replacement, or interior 
                painting in {city.name}, the key to a successful project starts with a clear, detailed project brief. 
                Most contractor quote confusion comes from vague scope descriptions — "I want a new kitchen" or 
                "update the bathroom" mean different things to different contractors.
              </p>
              <p>
                Naili helps you build a professional-grade project brief from just a photo and a few details. 
                You'll get estimated costs based on {city.name}'s market conditions, a detailed scope of work, 
                recommended materials, and concept images of what your finished project could look like. 
                When you share this brief with contractors, everyone starts from the same page — which means 
                better quotes, fewer surprises, and a smoother renovation.
              </p>
              <p>
                <Link href="/" className="text-sand-dark font-semibold underline underline-offset-2 hover:text-sand-700">
                  Start your free estimate →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* City Index */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Explore Other City Renovation Guides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TOP_50_CITIES.filter(c => c.slug !== city.slug).slice(0, 24).map((c) => (
            <Link
              key={c.slug}
              href={`/cities/${c.slug}`}
              className="text-sm text-ink-600 hover:text-sand-dark hover:underline underline-offset-2 transition-colors"
            >
              {c.name}, {c.stateAbbr}
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/cities" className="nl-pill inline-flex items-center gap-2">
            View all 50 city guides →
          </Link>
        </div>
      </section>
    </>
  );
}
