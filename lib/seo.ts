import { SITE_URL } from "./site";

/* ── WebSite Schema ── */
export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Naili",
    url: SITE_URL,
    description:
      "Upload a photo of your space. Get AI-powered cost estimates, material lists, and design concepts.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/* ── Organization Schema ── */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Naili",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [] as string[],
  };
}

/* ── BreadcrumbList Schema ── */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/* ── Article Schema (blog/cost guides) ── */
export interface ArticleData {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  url: string;
  imageUrl?: string;
}

export function articleSchema(article: ArticleData) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: "Naili",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
    ...(article.imageUrl && { image: article.imageUrl }),
  };
}

/* ── LocalBusiness Schema (city pages) ── */
export interface LocalBusinessData {
  name: string;
  description: string;
  address: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion: string;
    postalCode?: string;
    addressCountry: string;
  };
  telephone?: string;
  url?: string;
  image?: string;
  priceRange?: string;
}

export function localBusinessSchema(data: LocalBusinessData) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: data.name,
    description: data.description,
    address: {
      "@type": "PostalAddress",
      ...data.address,
    },
    ...(data.telephone && { telephone: data.telephone }),
    ...(data.url && { url: data.url }),
    ...(data.image && { image: data.image }),
    ...(data.priceRange && { priceRange: data.priceRange }),
  };
}

/* ── Render helper: returns a <script> tag string ── */
export function renderJsonLd(jsonLd: Record<string, unknown>): string {
  return `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
}
