'use client';

/**
 * 관심 공고 경계.
 *
 * 확정된 정책상 "저장"은 웹 전용 북마크가 아니라 **앱의 개인 공고(job_posting) 생성**이다.
 * (docs/backend-request-recruitment-catalog.md §2)
 * 지금은 브라우저 저장소로 흉내내고, 서버가 열리면 아래 세 함수만
 * POST/DELETE /recruitments/:id/save · GET /me/saved-recruitments 로 바꾼다.
 */

const STORAGE_KEY = 'trackareer.web.saved';

const read = (): number[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
};

const write = (ids: number[]) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* noop */
  }
};

export async function getSavedIds(): Promise<number[]> {
  return read();
}

/** `POST /recruitments/:id/save` — 이미 담겨 있어도 에러가 아니다(멱등) */
export async function saveRecruitment(id: number): Promise<number[]> {
  const ids = read();
  if (ids.includes(id)) return ids;
  const next = [...ids, id];
  write(next);
  return next;
}

/** `DELETE /recruitments/:id/save` */
export async function unsaveRecruitment(id: number): Promise<number[]> {
  const next = read().filter((savedId) => savedId !== id);
  write(next);
  return next;
}
