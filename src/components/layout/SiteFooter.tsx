import Link from 'next/link';
import {
  ACCOUNT_DELETE_PATH,
  APP_DOWNLOAD_PATH,
  CONTACT_EMAIL,
  JOB_INFO_LICENSE_NO,
} from '@/shared/config/site';
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
          <Link href={ACCOUNT_DELETE_PATH}>계정 삭제</Link>
          <Link href={legalDocPath('terms-of-service')}>이용약관</Link>
          <Link href={legalDocPath('privacy-policy')} className={styles.privacy}>
            개인정보 처리방침
          </Link>
        </div>
        직업정보제공사업 신고번호 {JOB_INFO_LICENSE_NO}
        <br />
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </div>
    </footer>
  );
}
