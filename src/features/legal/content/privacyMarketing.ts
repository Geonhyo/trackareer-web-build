import type { LegalDoc } from '../model/types';
import { COMPANY, EFFECTIVE_V2, EFFECTIVE_V2_LABEL, SUPPORT } from './company';

/**
 * 선택 동의. 광고성 정보를 실제로 보내는 것은 '마케팅 정보 수신 동의'가 따로 필요하다.
 * 문구를 고치면 version · effectiveDate를 올린다.
 */
export const privacyMarketing: LegalDoc = {
  slug: 'privacy-marketing',
  title: '개인정보 마케팅 활용 동의',
  description: '트래커리어 개인정보 마케팅 활용 동의(선택) 안내입니다.',
  version: '2.0',
  effectiveDate: EFFECTIVE_V2,
  blocks: [
    {
      type: 'p',
      text: `${COMPANY.name}(이하 “회사”)는 트래커리어 이용자에게 관심에 맞는 정보와 혜택을 제공하기 위해 아래와 같이 개인정보를 마케팅 목적으로 이용하려고 합니다.`,
    },
    {
      type: 'p',
      text: '이 동의는 **선택 사항**이며, 동의하지 않아도 서비스 이용에는 제한이 없습니다. 광고성 정보를 실제로 받으려면 ‘마케팅 정보 수신 동의’가 따로 필요합니다.',
    },
    { type: 'h2', text: '1. 이용 목적' },
    {
      type: 'ul',
      items: [
        '등록한 공고와 앱 이용 기록을 분석해 관심에 맞는 공고, 혜택, 이벤트 정보 선별',
        '이벤트와 프로모션 기획, 참여자 관리',
        '마케팅 효과 분석',
      ],
    },
    { type: 'h2', text: '2. 이용 항목' },
    {
      type: 'ul',
      items: [
        '이메일 주소, 닉네임',
        '등록한 공고 정보(회사명, 공고명, 공고 유형, 마감일)와 전형 진행 상황',
        '앱 이용 기록, 푸시 알림 토큰',
      ],
    },
    { type: 'h2', text: '3. 보유 및 이용 기간' },
    {
      type: 'p',
      text: '동의일로부터 **동의를 철회하거나 회원 탈퇴할 때까지** 이용합니다.',
    },
    { type: 'h2', text: '4. 동의를 거부할 권리' },
    {
      type: 'p',
      text: '동의를 거부할 수 있으며, 거부해도 **회원가입과 서비스 이용에 불이익이 없습니다.**',
    },
    { type: 'h2', text: '5. 동의 철회 방법' },
    {
      type: 'ul',
      items: [
        '앱의 마이페이지 > 알림 설정 > 개인정보 마케팅 활용 동의 끄기',
        `고객 문의(${SUPPORT})로 요청`,
      ],
    },
    { type: 'h2', text: '부칙' },
    { type: 'p', text: `이 동의서는 **${EFFECTIVE_V2_LABEL}부터 적용**합니다.` },
  ],
};
