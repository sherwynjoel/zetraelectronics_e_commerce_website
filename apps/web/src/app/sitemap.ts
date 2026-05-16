import { MetadataRoute } from 'next';

const BASE_URL = 'https://zetraelectronics.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${BASE_URL}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        { url: `${BASE_URL}/help`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
        { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ];

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=100`, {
            next: { revalidate: 3600 },
        });
        if (res.ok) {
            const products = await res.json();
            const productPages: MetadataRoute.Sitemap = (products.data ?? products).map((p: any) => ({
                url: `${BASE_URL}/products/${p.id}`,
                lastModified: new Date(p.updatedAt),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            }));
            return [...staticPages, ...productPages];
        }
    } catch {
        // If API unreachable during build, return static pages only
    }

    return staticPages;
}
