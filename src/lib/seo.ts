/**
 * Determines the Open Graph image URL based on the current pathname.
 * @param pathname The current URL pathname.
 * @param siteBase The base URL of the site.
 * @returns The absolute URL to the OG image.
 */
export function getOgImageUrl(pathname: string, siteBase: URL | string): string {
  const base = siteBase instanceof URL ? siteBase : new URL(siteBase);
  const isBlogPost = pathname.startsWith('/blog/') && !pathname.endsWith('/blog') && !pathname.endsWith('/blog/');

  if (isBlogPost) {
    // Extract slug cleanly
    const slug = pathname.split('/').filter(Boolean).pop();
    return new URL(`/og/blog/${slug}.webp`, base).toString();
  }

  return new URL('/og/default.webp', base).toString();
}