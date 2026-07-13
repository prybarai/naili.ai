import { MetadataRoute } from "next";
import { COST_GUIDES_ALL } from "@/lib/costGuides";
import { TOP_50_CITIES } from "@/lib/cities/cityData";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: "https://www.naili.ai", lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1.0 },
    { url: "https://www.naili.ai/blog", lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.95 },
    { url: "https://www.naili.ai/calculators", lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.85 },
    { url: "https://www.naili.ai/cities", lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: "https://www.naili.ai/get-quotes", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: "https://www.naili.ai/my-projects", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: "https://www.naili.ai/pro", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: "https://www.naili.ai/privacy", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
  ];

  const guidePages = COST_GUIDES_ALL.map((guide) => ({
    url: `https://www.naili.ai/blog/${guide.slug}`,
    lastModified: new Date(guide.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const cityPages = TOP_50_CITIES.map((city) => ({
    url: `https://www.naili.ai/cities/${city.slug}`,
    lastModified: new Date("2026-07-13"),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...guidePages, ...cityPages];
}
