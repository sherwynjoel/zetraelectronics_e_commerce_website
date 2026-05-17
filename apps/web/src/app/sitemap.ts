import { MetadataRoute } from 'next';

const BASE_URL = 'https://zetraelectronics.com';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://zetraelectronics.com/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${BASE_URL}/help`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${BASE_URL}/track-order`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
        { url: `${BASE_URL}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
        { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
        { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    ];

    try {
        const [productsRes, categoriesRes] = await Promise.all([
            fetch(`${API}/products?limit=500`, { next: { revalidate: 3600 } }),
            fetch(`${API}/categories`, { next: { revalidate: 3600 } }),
        ]);

        const productPages: MetadataRoute.Sitemap = productsRes.ok
            ? (await productsRes.json()).map((p: any) => ({
                url: `${BASE_URL}/products/${p.id}`,
                lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            }))
            : [];

        const categoryPages: MetadataRoute.Sitemap = categoriesRes.ok
            ? (await categoriesRes.json()).map((c: any) => ({
                url: `${BASE_URL}/products?category=${encodeURIComponent(c.name)}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.75,
            }))
            : [];

        return [...staticPages, ...categoryPages, ...productPages];
    } catch {
        // Return static pages if API unreachable during build
    }

    return staticPages;
}
