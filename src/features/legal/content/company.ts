import { SUPPORT_EMAIL } from '@/shared/config/site';

/** 서비스 제공 주체. 약관 · 처리방침에 쓴다. */
export const COMPANY = {
  name: '모어댄데이',
  ceo: '박건효',
  bizNo: '872-38-01256',
  address: '인천광역시 연수구 하모니로 158, D동 3층 317-A315호(송도동, 송도 타임스페이스)',
  /** 개인정보 보호책임자 */
  privacyOfficer: '박건효(대표)',
} as const;

/** 약관 4종 v2.0 시행일. 배포일이 바뀌면 이 값만 고친다 */
export const EFFECTIVE_V2 = '2026-10-12';

const [y, m, d] = EFFECTIVE_V2.split('-').map(Number);
/** 본문용 시행일 표기(예: 2026년 10월 12일) */
export const EFFECTIVE_V2_LABEL = `${y}년 ${m}월 ${d}일`;

/** 본문용 고객 문의 메일 링크 */
export const SUPPORT = `[${SUPPORT_EMAIL}](mailto:${SUPPORT_EMAIL})`;
