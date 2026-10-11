import type { Metadata } from 'next';
import { pretendard } from './font';
import './globals.css';
import { SessionProvider } from '@/features/auth/ui/SessionProvider';
import { SavedProvider } from '@/features/saved/ui/SavedProvider';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import shell from '@/components/layout/AppShell.module.css';
import { SITE_NAME, SITE_URL } from '@/shared/config/site';

const DESCRIPTION =
  '신입·인턴 채용 공고를 직무별로 모아 보고, 마감일을 달력으로 한눈에 확인하세요. 관심 공고를 저장하면 트래커리어 앱이 마감 전에 알려드려요.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | 신입·인턴 채용 공고`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    '트래커리어',
    '신입 채용',
    '인턴 채용',
    '채용 공고',
    '공채 일정',
    '채용 마감일',
    '취업 준비',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: SITE_NAME,
    title: `${SITE_NAME} | 신입·인턴 채용 공고`,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  category: 'career',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={pretendard.variable}>
        <SessionProvider>
          <SavedProvider>
            <div className={shell.shell}>
              <SiteHeader />
              <main className={shell.main}>{children}</main>
              <SiteFooter />
            </div>
          </SavedProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
