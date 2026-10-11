import type { Metadata } from 'next';
import { AppDownload, APP_DOWNLOAD_LEDE } from '@/features/app-download/ui/AppDownload';
import { APP_DOWNLOAD_PATH, OG_IMAGE, SITE_NAME } from '@/shared/config/site';

const TITLE = '앱 다운로드';
const DESCRIPTION = `트래커리어 앱을 다운로드하세요. ${APP_DOWNLOAD_LEDE}`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: APP_DOWNLOAD_PATH },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: APP_DOWNLOAD_PATH,
    siteName: SITE_NAME,
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function AppDownloadPage() {
  return <AppDownload />;
}
