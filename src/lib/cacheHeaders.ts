/*
 * Cloudflare Cache Helper for Supabase REST Endpoints
 *
 * Supabase's REST API (PostgREST) returns responses that Cloudflare can cache
 * at the edge if the right Cache-Control headers are present. This module
 * provides utilities for:
 *
 * 1. Building cache-friendly fetch headers for public read requests.
 * 2. A reference document for configuring Cloudflare Cache Rules.
 *
 * --- When to use ---
 *
 * Use `cachedFetchOptions()` only for public, non-authenticated GET requests
 * (e.g., the storefront product catalog and store settings). Authenticated
 * requests (orders, profiles, admin mutations) must NOT be cached at the edge
 * — they carry user-specific JWTs and return private data.
 *
 * --- How it works ---
 *
 * Supabase JS client already handles auth headers internally. For edge caching,
 * the key is configuring Cloudflare Cache Rules (see CLOUDFLARE_CACHE_RULES
 * below) to cache responses from `/rest/v1/products?select=...` and
 * `/rest/v1/store_settings?select=...` when the `apikey` header is the anon
 * key (public reads). Authenticated requests with `Authorization: Bearer`
 * are automatically excluded by matching only on the anon-key path.
 */

export interface CacheFetchOptions {
  headers: Record<string, string>;
  cache: 'force-cache' | 'no-store';
  next?: { revalidate: number };
}

/*
 * Returns fetch options for client-side caching of public Supabase REST calls.
 * `revalidate` sets how long (in seconds) the cached response is considered
 * fresh before a background revalidation is triggered.
 *
 * Default: 600 seconds (10 minutes) — matches the staleTime for public data.
 */
export function cachedFetchOptions(revalidateSeconds: number = 600): CacheFetchOptions {
  return {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=600, stale-while-revalidate=300',
    },
    cache: 'force-cache',
    next: { revalidate: revalidateSeconds },
  };
}

/*
 * Returns fetch options that explicitly bypass caching — for authenticated
 * or mutation requests.
 */
export function noCacheFetchOptions(): CacheFetchOptions {
  return {
    headers: {
      'Cache-Control': 'no-store, private',
    },
    cache: 'no-store',
  };
}

/*
 * Cloudflare Cache Rules reference.
 *
 * These are recommendations for the Cloudflare dashboard (or Wrangler config).
 * Copy these into Cloudflare → Caching → Cache Rules for your Supabase domain.
 */
export const CLOUDFLARE_CACHE_RULES = `
# Cloudflare Cache Rules for Moran Pharmacy Supabase

## Rule 1: Cache public product catalog reads
Priority: 10
When:
  URI Path matches "/rest/v1/products"
  AND URI Query String contains "select="
  AND Request Method is GET
Then:
  Cache eligibility: Eligible for cache
  Edge TTL: 600 seconds (10 minutes)
  Browser TTL: 60 seconds (1 minute)
  Cache key:
    - Include: URI path, query string
    - Exclude: apikey header (same anon key for all users)

## Rule 2: Cache store settings reads
Priority: 11
When:
  URI Path matches "/rest/v1/store_settings"
  AND Request Method is GET
Then:
  Cache eligibility: Eligible for cache
  Edge TTL: 600 seconds
  Browser TTL: 60 seconds
  Cache key:
    - Include: URI path, query string

## Rule 3: Bypass cache for authenticated requests
Priority: 5 (evaluated first)
When:
  Header "Authorization" contains "Bearer eyJ"
  (i.e., any request with a user JWT — orders, profiles, mutations)
Then:
  Cache eligibility: Bypass cache

## Rule 4: Bypass cache for all non-GET methods
Priority: 6
When:
  Request Method is not GET
Then:
  Cache eligibility: Bypass cache
` as string;

/*
 * Supabase REST endpoint URLs that are safe for edge caching.
 * Exported so they can be referenced in deployment scripts or documentation.
 */
export const CACHEABLE_ENDPOINTS = {
  products: '/rest/v1/products',
  storeSettings: '/rest/v1/store_settings',
} as const;
