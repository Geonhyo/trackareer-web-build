/**
 * 마감일 표기는 사용자의 브라우저 타임존과 무관하게 항상 한국 기준이어야 한다.
 * 서버의 "MVP는 한국 시간 단일 처리" 방침과 같은 규칙이다.
 */
const TIME_ZONE = 'Asia/Seoul';
const DOW = '일월화수목금토';
const MS_PER_DAY = 86_400_000;

const seoulParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const pad = (n: number) => String(n).padStart(2, '0');

/** `yyyy-MM-dd` 문자열을 로컬 자정 Date로 해석한다. 날짜 비교 전용. */
export const parseDateKey = (key: string): Date => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** 한국 기준 '오늘'을 로컬 자정 Date로 돌려준다. */
export const todayInSeoul = (): Date => parseDateKey(seoulParts.format(new Date()));

/** 남은 일수. 음수면 마감 경과. `deadline`이 없으면 null. */
export const getDday = (deadline: string | null, today = todayInSeoul()): number | null => {
  if (!deadline) return null;
  return Math.round((parseDateKey(deadline).getTime() - today.getTime()) / MS_PER_DAY);
};

export const isExpired = (deadline: string | null, today = todayInSeoul()): boolean => {
  const dday = getDday(deadline, today);
  return dday !== null && dday < 0;
};

/** 카드 배지·상세 헤드라인에 쓰는 라벨. */
export const getDdayLabel = (deadline: string | null, today = todayInSeoul()): string => {
  const dday = getDday(deadline, today);
  if (dday === null) return '상시';
  if (dday < 0) return '마감';
  if (dday === 0) return '오늘 마감';
  return `D-${dday}`;
};

/** `09.16(수) 18:00 마감` 형태의 마감 표기. */
export const getDeadlineText = (deadline: string | null, deadlineTime: string | null): string => {
  if (!deadline) return '마감일 없음';
  const date = parseDateKey(deadline);
  const time = deadlineTime ? ` ${deadlineTime.slice(0, 5)}` : '';
  return `${pad(date.getMonth() + 1)}.${pad(date.getDate())}(${DOW[date.getDay()]})${time} 마감`;
};

export const getDayOfWeek = (date: Date): string => DOW[date.getDay()];

/** `9월 16일 수요일` */
export const getFullDateText = (date: Date): string =>
  `${date.getMonth() + 1}월 ${date.getDate()}일 ${DOW[date.getDay()]}요일`;

/**
 * 마감 임박순 정렬.
 * 마감일 오름차순 → 마감시각 오름차순(미명시는 뒤) → 회사명.
 * 마감 없음(`deadline === null`)은 항상 맨 뒤.
 */
export const compareByDeadline = (
  a: { deadline: string | null; deadlineTime: string | null; company: { name: string } },
  b: { deadline: string | null; deadlineTime: string | null; company: { name: string } },
): number => {
  if (a.deadline === null || b.deadline === null) {
    if (a.deadline === b.deadline) return a.company.name.localeCompare(b.company.name, 'ko');
    return a.deadline === null ? 1 : -1;
  }
  if (a.deadline !== b.deadline) return a.deadline < b.deadline ? -1 : 1;
  // 미명시(null)는 `23:59` 명시보다 뒤로 — 서버 도메인 규칙과 동일
  const timeA = a.deadlineTime ?? '99:99';
  const timeB = b.deadlineTime ?? '99:99';
  if (timeA !== timeB) return timeA < timeB ? -1 : 1;
  return a.company.name.localeCompare(b.company.name, 'ko');
};

/** 최근 등록순 정렬. */
export const compareByPublishedAt = (
  a: { publishedAt: string; id: number },
  b: { publishedAt: string; id: number },
): number =>
  a.publishedAt === b.publishedAt ? b.id - a.id : a.publishedAt < b.publishedAt ? 1 : -1;

/** 달력 셀 42칸(6주)의 시작일. 해당 월 1일이 속한 주의 일요일. */
export const getCalendarStart = (year: number, month: number): Date => {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  return start;
};
