import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/shared/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 개인화 화면은 색인 대상이 아니다
      disallow: ['/login', '/saved', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
