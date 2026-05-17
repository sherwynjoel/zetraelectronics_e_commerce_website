import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/checkout/', '/profile/', '/cart/'],
            },
        ],
        sitemap: 'https://zetraelectronics.com/sitemap.xml',
        host: 'https://zetraelectronics.com',
    };
}
