import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TermsClient } from './TermsClient';
import { toSafeNext } from '@/shared/lib/safeNext';
import { RECRUITMENT_CATALOG_ENABLED } from '@/shared/config/site';

export const metadata: Metadata = {
  title: '약관 동의',
  alternates: { canonical: '/login/terms' },
  robots: { index: false, follow: false },
};

export default async function TermsPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (!RECRUITMENT_CATALOG_ENABLED) notFound();
  const { next } = await searchParams;
  return <TermsClient next={toSafeNext(next)} />;
}
