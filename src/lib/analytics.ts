// Lightweight analytics helper with graceful fallbacks
// Usage: track('cta_click', { location: 'navbar', label: 'Commencer', href: '/register' })

declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>;
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
  }
}

export function track(event: string, props?: Record<string, any>): void {
  if (typeof window === "undefined") return;
  try {
    // Google Tag Manager / GA4 via dataLayer (if present)
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...props });

    // Plausible analytics (if present)
    if (typeof window.plausible === "function") {
      window.plausible(event, props ? { props } : undefined);
    }
  } catch (err) {
    // Silent fallback in production; debug in dev
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("track:", event, props);
    }
  }
}
