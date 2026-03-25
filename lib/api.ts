/**
 * Build an absolute API URL.
 * In the Capacitor native app, NEXT_PUBLIC_API_URL points to the Vercel deployment.
 * In web/dev, it defaults to relative URLs (same origin).
 */
export function api(path: string): string {
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    return `${base}${path}`;
}
