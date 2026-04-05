import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/settings','/organizations', '/admin'],
    },
    sitemap: 'https://litmuscheck.com/sitemap.xml',
  }
}