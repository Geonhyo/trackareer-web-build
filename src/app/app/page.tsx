import type { Metadata } from 'next';
import { Wordmark } from '@/components/layout/Wordmark';
import {
  ANDROID_WAITLIST_FORM_URL,
  APP_DOWNLOAD_PATH,
  APP_STORE_URL,
  PLAY_STORE_URL,
  SITE_NAME,
} from '@/shared/config/site';
import styles from './appDownload.module.css';

const TITLE = '앱 다운로드';
const DESCRIPTION =
  '트래커리어 앱을 다운로드하고 관심 공고의 마감일 알림을 받아보세요. 웹에서 담아둔 공고가 앱에 그대로 이어집니다.';

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
  },
};

// 안드로이드 앱 출시 전에는 스토어 대신 출시 알림 신청 폼으로 연결한다
const isPlayStoreReleased = PLAY_STORE_URL.length > 0;

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon} fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function GooglePlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path
        d="M3.609 1.814L13.792 12 3.61 22.186a1.63 1.63 0 0 1-.61-1.276V3.09c0-.5.234-.947.61-1.276z"
        fill="#00A0FF"
      />
      <path
        d="M17.107 15.315L13.792 12l3.315-3.315 3.93 2.233c1.24.705 1.24 2.459 0 3.164l-3.93 2.233z"
        fill="#FFBC00"
      />
      <path
        d="M17.107 15.315L13.792 12 3.609 22.186c.42.368 1.05.393 1.54.117l11.958-6.988z"
        fill="#FF3A44"
      />
      <path
        d="M17.107 8.685L5.149 1.697c-.49-.276-1.12-.251-1.54.117L13.792 12l3.315-3.315z"
        fill="#00E676"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.icon}
    >
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export default function AppDownloadPage() {
  return (
    <div className={styles.page}>
      <Wordmark className={styles.wm} />
      <h1>앱에서 트래커리어를 시작하세요</h1>
      <p className={styles.lede}>
        웹에서 저장한 관심 공고가 앱에 그대로 담기고, 마감 전에 알림으로 알려드려요.
      </p>

      <div className={styles.buttons}>
        <a
          className={`${styles.store} ${styles.primary}`}
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <AppleIcon />
          App Store
        </a>
        <a
          className={`${styles.store} ${styles.secondary}`}
          href={isPlayStoreReleased ? PLAY_STORE_URL : ANDROID_WAITLIST_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {isPlayStoreReleased ? <GooglePlayIcon /> : <BellIcon />}
          {isPlayStoreReleased ? 'Google Play' : '안드로이드 출시 알림 신청'}
        </a>
      </div>

      {isPlayStoreReleased ? null : <p className={styles.note}>안드로이드는 준비 중이에요</p>}
    </div>
  );
}
