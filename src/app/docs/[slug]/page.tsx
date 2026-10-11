import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLegalDoc, LEGAL_DOCS, legalDocPath } from '@/features/legal/content';
import { LegalDocument } from '@/features/legal/ui/LegalDocument';
import { SITE_NAME } from '@/shared/config/site';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** 약관 4종만 빌드 때 만든다. 그 밖의 slug는 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_DOCS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const doc = getLegalDoc((await params).slug);
  if (!doc) return {};

  const path = legalDocPath(doc.slug);
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      url: path,
      siteName: SITE_NAME,
      title: `${doc.title} | ${SITE_NAME}`,
      description: doc.description,
    },
  };
}

export default async function LegalDocPage({ params }: PageProps) {
  const doc = getLegalDoc((await params).slug);
  if (!doc) notFound();
  return <LegalDocument doc={doc} />;
}
