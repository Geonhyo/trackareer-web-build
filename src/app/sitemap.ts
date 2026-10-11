import type { MetadataRoute } from 'next';
import { getRecruitments } from '@/features/recruitments/service/recruitmentService';
import { LEGAL_DOCS, legalDocPath } from '@/features/legal/content';
import { APP_DOWNLOAD_PATH, SITE_URL } from '@/shared/config/site';

/**
 * 공고는 마감 경과분까지 싣는다 — 지난 공고도 검색 유입 가치가 있다.
 * sitemap은 metadataBase를 적용받지 않으므로 url을 직접 절대 주소로 만든다.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { items } = await getRecruitments({ includeExpired: true, limit: 1000 });

  const entries: MetadataRoute.Sitemap = [
    { url: '/', changeFrequency: 'daily', priority: 1 },
    { url: '/calendar', changeFrequency: 'daily', priority: 0.8 },
    { url: APP_DOWNLOAD_PATH, changeFrequency: 'monthly', priority: 0.5 },
    ...LEGAL_DOCS.map((doc) => ({
      url: legalDocPath(doc.slug),
      lastModified: new Date(doc.effectiveDate),
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    })),
    ...items.map((item) => ({
      url: `/recruitments/${item.id}`,
      lastModified: new Date(item.publishedAt),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
  ];
  return entries.map((entry) => ({ ...entry, url: `${SITE_URL}${entry.url}` }));
}
