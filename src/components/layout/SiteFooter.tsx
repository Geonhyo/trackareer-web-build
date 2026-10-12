import Link from 'next/link';
import {
  ACCOUNT_DELETE_PATH,
  APP_DOWNLOAD_PATH,
  BUSINESS_EMAIL,
  SITE_NAME,
  SUPPORT_EMAIL,
} from '@/shared/config/site';
import { legalDocPath } from '@/features/legal/content';
import { BrandLogo } from './BrandLogo';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.ftr}>
      <div className={styles.top}>
        <BrandLogo className={styles.logo} />
        <nav className={styles.links} aria-label="사이트 정보">
          <Link href={APP_DOWNLOAD_PATH}>앱 다운로드</Link>
          <Link href={ACCOUNT_DELETE_PATH}>계정 삭제</Link>
          <Link href={legalDocPath('terms-of-service')}>이용약관</Link>
          <Link href={legalDocPath('privacy-policy')} className={styles.privacy}>
            개인정보 처리방침
          </Link>
        </nav>
      </div>

      <dl className={styles.contacts}>
        <div>
          <dt>고객 문의</dt>
          <dd>
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </dd>
        </div>
        <div>
          <dt>광고 · 제휴 문의</dt>
          <dd>
            <a href={`mailto:${BUSINESS_EMAIL}`}>{BUSINESS_EMAIL}</a>
          </dd>
        </div>
      </dl>

      <p className={styles.copy}>© {SITE_NAME}</p>
    </footer>
  );
}
