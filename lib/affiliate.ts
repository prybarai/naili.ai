/**
 * Affiliate link utility for Naili
 * 
 * Adds affiliate tracking parameters to retailer URLs.
 * Revenue is generated when users click through and purchase materials.
 * 
 * To activate affiliate revenue:
 * 1. Sign up for each retailer's affiliate program
 * 2. Add your affiliate IDs to environment variables
 * 3. The links will automatically include tracking
 * 
 * Supported programs:
 * - Home Depot: Impact Radius affiliate program
 * - Lowe's: Impact Radius affiliate program  
 * - Amazon: Amazon Associates program
 * - Build.com: CJ Affiliate program
 */

const AFFILIATE_CONFIG: Record<string, {
  paramName: string;
  envKey: string;
  utmSource: string;
}> = {
  'homedepot': {
    paramName: 'cm_mmc',
    envKey: 'HOMEDEPOT_AFFILIATE_ID',
    utmSource: 'naili',
  },
  'lowes': {
    paramName: 'cm_mmc',
    envKey: 'LOWES_AFFILIATE_ID',
    utmSource: 'naili',
  },
  'amazon': {
    paramName: 'tag',
    envKey: 'AMAZON_AFFILIATE_TAG',
    utmSource: 'naili',
  },
  'build': {
    paramName: 'aid',
    envKey: 'BUILD_AFFILIATE_ID',
    utmSource: 'naili',
  },
};

/**
 * Detect which retailer a URL belongs to
 */
function detectRetailer(url: string): string | null {
  const lc = url.toLowerCase();
  if (lc.includes('homedepot.com')) return 'homedepot';
  if (lc.includes('lowes.com')) return 'lowes';
  if (lc.includes('amazon.com')) return 'amazon';
  if (lc.includes('build.com')) return 'build';
  return null;
}

/**
 * Add affiliate tracking to a retailer URL.
 * Returns the original URL if no affiliate ID is configured.
 */
export function addAffiliateTracking(url: string): string {
  if (!url) return url;

  try {
    const retailer = detectRetailer(url);
    if (!retailer) return url;

    const config = AFFILIATE_CONFIG[retailer];
    if (!config) return url;

    const affiliateId = process.env[config.envKey];
    
    const parsed = new URL(url);
    
    // Always add UTM tracking for analytics
    parsed.searchParams.set('utm_source', config.utmSource);
    parsed.searchParams.set('utm_medium', 'referral');
    parsed.searchParams.set('utm_campaign', 'materials_list');
    
    // Add affiliate parameter if configured
    if (affiliateId) {
      parsed.searchParams.set(config.paramName, affiliateId);
    }
    
    return parsed.toString();
  } catch {
    // If URL parsing fails, return original
    return url;
  }
}

/**
 * Process all material items and add affiliate tracking to their URLs
 */
export function addAffiliateTrackingToMaterials<T extends { retailer_url?: string }>(
  items: T[]
): T[] {
  return items.map((item) => ({
    ...item,
    retailer_url: item.retailer_url ? addAffiliateTracking(item.retailer_url) : item.retailer_url,
  }));
}
