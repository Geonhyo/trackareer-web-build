import type { Metadata } from 'next';
import AccountDeleteClient from './AccountDeleteClient';
import { COMPANY } from '@/features/legal/content/company';
import { ACCOUNT_DELETE_PATH, OG_IMAGE, SITE_NAME, SUPPORT_EMAIL } from '@/shared/config/site';
import styles from './accountDelete.module.css';

const TITLE = '계정 삭제 요청';
const DESCRIPTION =
  '트래커리어 계정 삭제를 요청합니다. 카카오로 로그인하면 앱을 설치하지 않고도 삭제를 요청할 수 있어요.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // 미지정 시 root layout의 canonical '/'가 상속돼 홈으로 자기표준화된다
  alternates: { canonical: ACCOUNT_DELETE_PATH },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: ACCOUNT_DELETE_PATH,
    siteName: SITE_NAME,
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

/**
 * 계정 삭제 요청 페이지(Google Play 요구사항).
 *
 * 🔴 앱 이름·삭제 절차·문의 채널은 이 서버 컴포넌트에서 정적으로 렌더한다.
 * 스크립트가 실패해도 "오류 없이 로드"와 "앱 이름 표시" 요건이 살아 있어야 하므로,
 * 클라이언트 컴포넌트에는 로그인·폼 위젯만 둔다.
 *
 * 지금은 카카오 계정만 받는다. 웹에 애플 로그인이 붙으면(웹 정식 오픈) 애플도 여기서 받는다.
 * 삭제 · 보관 문구는 개인정보 처리방침 제3조, 이용약관 제7조와 맞춘다.
 */
export default function AccountDeletePage() {
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>트래커리어 계정 삭제 요청</h1>
        <p>
          취준 일정 관리 앱 트래커리어(운영: {COMPANY.name})의 계정 삭제 요청 페이지입니다. 앱을
          설치하지 않고도 여기에서 삭제를 요청할 수 있어요.
        </p>
      </header>

      <section className={styles.box}>
        <h2>삭제 절차와 보관 안내</h2>
        <ul>
          <li>카카오로 로그인해 본인 확인 후 삭제를 요청합니다.</li>
          <li>요청하면 바로 로그인과 알림이 중단되고, 요청일로부터 30일 동안 계정을 보관합니다.</li>
          <li>
            30일이 지나면 이메일, 카카오 · Apple 식별자, 닉네임, 인증 · 푸시 알림 토큰 등 회원을
            알아볼 수 있는 정보를 파기하고 카카오 · Apple 연결을 해제합니다.
          </li>
          <li>
            나머지 이용 기록(공고 · 전형 · 메모 · 문의 내용, 기기 종류와 앱 버전, 동의 기록, 탈퇴
            사유)은 회원을 알아볼 수 없는 상태로 서비스 개선과 통계에 이용합니다.
          </li>
          <li>
            30일 안에 앱에서 다시 로그인하면 계정을 복구할 수 있고, 30일이 지나면 복구할 수
            없습니다.
          </li>
        </ul>
      </section>

      <AccountDeleteClient />

      <section className={styles.foot}>
        <p>
          <b>Apple로 가입하신 분</b>은 아직 이 페이지에서 삭제할 수 없습니다. 앱의 마이페이지 &gt;
          계정 관리 &gt; 계정 삭제에서 삭제하시거나 아래 메일로 요청해 주세요.
        </p>
        <p>
          문의·삭제 요청: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
        <p className={styles.small}>
          공용 PC를 사용 중이라면 요청 후 카카오계정에서도 로그아웃해 주세요.
        </p>
      </section>
    </div>
  );
}
