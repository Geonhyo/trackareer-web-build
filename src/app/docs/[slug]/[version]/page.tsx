import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getLegalDocVersion,
  getPreviousVersions,
  LEGAL_DOCS,
  legalDocPath,
} from '@/features/legal/content';
import { LegalDocument } from '@/features/legal/ui/LegalDocument';

interface PageProps {
  params: Promise<{ slug: string; version: string }>;
}

/** 이전 버전만 빌드 때 만든다. 현재 버전 번호나 없는 버전은 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_DOCS.flatMap((doc) =>
    getPreviousVersions(doc.slug).map((old) => ({ slug: doc.slug, version: old.version })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, version } = await params;
  const doc = getLegalDocVersion(slug, version);
  if (!doc) return {};
  return {
    title: `${doc.title} (버전 ${doc.version})`,
    description: doc.description,
    alternates: { canonical: legalDocPath(doc.slug, doc.version) },
    // 검색 결과에는 현재 버전만 나오게 한다
    robots: { index: false, follow: true },
  };
}

export default async function LegalDocVersionPage({ params }: PageProps) {
  const { slug, version } = await params;
  const doc = getLegalDocVersion(slug, version);
  if (!doc) notFound();
  return <LegalDocument doc={doc} />;
}
