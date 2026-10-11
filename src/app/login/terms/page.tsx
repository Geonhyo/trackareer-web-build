import type { Metadata } from 'next';
import { TermsClient } from './TermsClient';
import { toSafeNext } from '@/shared/lib/safeNext';

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
  const { next } = await searchParams;
  return <TermsClient next={toSafeNext(next)} />;
}
