import type { LegalDoc } from '../model/types';
import { COMPANY, EFFECTIVE_V2, EFFECTIVE_V2_LABEL, SUPPORT } from './company';

/**
 * 광고성 정보 수신 동의(정보통신망법 제50조). 전송 원칙은 서버 push-campaign과 같아야 한다
 * ((광고) 표시 · 수신 거부 안내 · 21시~8시 발송 차단).
 * 문구를 고치면 version · effectiveDate를 올리고 직전 본문은 archive/로 옮긴다.
 */
export const marketingNotification: LegalDoc = {
  slug: 'marketing-notification',
  title: '마케팅 정보 수신 동의',
  description: '트래커리어 마케팅 정보 수신 동의(선택) 안내입니다.',
  version: '2.0',
  effectiveDate: EFFECTIVE_V2,
  blocks: [
    {
      type: 'p',
      text: `${COMPANY.name}(이하 “회사”)는 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」에 따라 트래커리어 이용자에게 광고성 정보를 보내기 위해 아래와 같이 수신 동의를 받습니다.`,
    },
    {
      type: 'p',
      text: '이 동의는 **선택 사항**이며, 동의하지 않아도 서비스 이용에는 제한이 없습니다. 일정 알림, 공지, 문의 답변처럼 서비스 이용에 필요한 알림은 이 동의와 관계없이 보냅니다.',
    },
    { type: 'h2', text: '1. 받게 되는 정보' },
    {
      type: 'ul',
      items: [
        '마감이 임박한 공고와 채용 소식',
        '트래커리어의 새 기능, 이벤트, 혜택 안내',
        '제휴 콘텐츠와 광고성 정보',
      ],
    },
    { type: 'h2', text: '2. 전송 방법' },
    { type: 'ul', items: ['앱 푸시 알림', '이메일'] },
    { type: 'h2', text: '3. 이용 항목' },
    { type: 'ul', items: ['푸시 알림 토큰', '이메일 주소'] },
    { type: 'h2', text: '4. 전송 원칙' },
    {
      type: 'ul',
      items: [
        '광고성 정보는 제목 앞에 **(광고)**를 표시하고, 수신을 거부하는 방법을 함께 안내합니다.',
        '오후 9시부터 다음 날 오전 8시까지는 광고성 정보를 보내지 않습니다.',
        '수신 동의일로부터 2년마다 수신 동의 여부를 다시 확인합니다.',
        '수신 동의나 철회를 처리하면 처리 일시와 결과를 알려 드립니다.',
      ],
    },
    { type: 'h2', text: '5. 보유 및 이용 기간' },
    {
      type: 'p',
      text: '동의일로부터 **동의를 철회하거나 회원 탈퇴할 때까지** 이용합니다.',
    },
    { type: 'h2', text: '6. 동의를 거부할 권리' },
    {
      type: 'p',
      text: '동의를 거부할 수 있으며, 거부해도 **회원가입과 서비스 이용에 불이익이 없습니다.**',
    },
    { type: 'h2', text: '7. 수신 거부(동의 철회) 방법' },
    {
      type: 'ul',
      items: [
        '앱의 마이페이지 > 알림 설정 > 마케팅 수신 동의 끄기',
        `고객 문의(${SUPPORT})로 요청`,
      ],
    },
    { type: 'h2', text: '부칙' },
    { type: 'p', text: `이 동의서는 **${EFFECTIVE_V2_LABEL}부터 적용**합니다.` },
  ],
};
