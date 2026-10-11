import Link from 'next/link';
import { APP_DOWNLOAD_PATH, BUSINESS_EMAIL, SUPPORT_EMAIL } from '@/shared/config/site';
import { legalDocPath } from '@/features/legal/content';
import { Wordmark } from './Wordmark';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.ftr}>
      <Wordmark className={styles.wm} />
      <div className={styles.info}>
        <div className={styles.links}>
          <Link href={APP_DOWNLOAD_PATH}>앱 다운로드</Link>
          <Link href={legalDocPath('terms-of-service')}>이용약관</Link>
          <Link href={legalDocPath('privacy-policy')} className={styles.privacy}>
            개인정보 처리방침
          </Link>
        </div>
        고객 문의 <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        <br />
        광고 · 제휴 문의 <a href={`mailto:${BUSINESS_EMAIL}`}>{BUSINESS_EMAIL}</a>
      </div>
    </footer>
  );
}
