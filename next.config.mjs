/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
        ],
        unoptimized: true, // Required for static export (Capacitor)
    },
    // Static export for Capacitor — API routes are deployed separately to Vercel.
    // Uncomment when building for iOS native:
    // output: 'export',
    // trailingSlash: true,
};

export default nextConfig;
