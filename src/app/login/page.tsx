import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LoginClient } from './LoginClient';
import { toSafeNext } from '@/shared/lib/safeNext';
import { RECRUITMENT_CATALOG_ENABLED } from '@/shared/config/site';

export const metadata: Metadata = {
  title: '로그인',
  description: '트래커리어에 로그인하고 관심 공고를 저장하세요.',
  alternates: { canonical: '/login' },
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (!RECRUITMENT_CATALOG_ENABLED) notFound();
  const { next } = await searchParams;
  return <LoginClient next={toSafeNext(next)} />;
}
