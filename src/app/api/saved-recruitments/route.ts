import { NextResponse } from 'next/server';
import { getRecruitmentsByIds } from '@/features/recruitments/service/recruitmentService';

/**
 * 관심 공고 목록 (BFF).
 *
 * 지금은 클라이언트가 보관 중인 id를 받아 공고를 채워주는 임시 구현이다.
 * W4에서 세션 쿠키가 생기면 `ids` 없이 서버의 `GET /me/saved-recruitments`를 중계하도록 바꾼다.
 */
export async function GET(request: Request) {
  const idsParam = new URL(request.url).searchParams.get('ids') ?? '';
  const ids = idsParam
    .split(',')
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);

  const items = ids.length ? await getRecruitmentsByIds(ids) : [];
  return NextResponse.json({ items });
}
