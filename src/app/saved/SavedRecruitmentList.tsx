'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSaved } from '@/features/saved/ui/SavedProvider';
import { useSession } from '@/features/auth/ui/SessionProvider';
import { RecruitmentCard } from '@/features/recruitments/ui/RecruitmentCard';
import type { RecruitmentListItem } from '@/features/recruitments/model/types';

export function SavedRecruitmentList() {
  const { status } = useSession();
  const { savedIds, isReady } = useSaved();
  // 응답을 요청 키와 함께 담아둔다 — 저장 목록이 바뀌면 이전 응답을 쓰지 않는다
  const [fetched, setFetched] = useState<{ key: string; items: RecruitmentListItem[] } | null>(
    null,
  );

  const idsKey = [...savedIds].sort((a, b) => a - b).join(',');

  useEffect(() => {
    if (!isReady || status !== 'authenticated' || !idsKey) return;
    let alive = true;
    fetch(`/api/saved-recruitments?ids=${idsKey}`)
      .then((response) => response.json())
      .then((data: { items: RecruitmentListItem[] }) => {
        if (alive) setFetched({ key: idsKey, items: data.items });
      })
      .catch(() => {
        if (alive) setFetched({ key: idsKey, items: [] });
      });
    return () => {
      alive = false;
    };
  }, [idsKey, isReady, status]);

  const items: RecruitmentListItem[] | null = !idsKey
    ? []
    : fetched?.key === idsKey
      ? fetched.items
      : null;

  if (status === 'loading' || (status === 'authenticated' && items === null)) {
    return <p className="seclede">관심 공고를 불러오는 중이에요.</p>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="center">
        <h2>
          로그인하면 관심 공고를
          <br />
          여기에 모아둘 수 있어요
        </h2>
        <p className="lede">저장한 공고의 마감일만 달력으로 따로 볼 수 있어요.</p>
        <div style={{ marginTop: 'var(--x8)', display: 'grid', gap: 'var(--x2_5)' }}>
          <Link href="/login" className="btnLg brand">
            로그인하러 가기
          </Link>
        </div>
      </div>
    );
  }

  const rows = items ?? [];

  return (
    <>
      <div className="sechead">
        <span className="em" aria-hidden="true">
          ★
        </span>
        <h2>관심 공고</h2>
        <div className="acts">
          <Link href="/calendar" className="btn brand">
            마감 캘린더 보기
          </Link>
        </div>
      </div>
      <p className="seclede">
        저장한 공고 {rows.length}개를 마감이 가까운 순으로 보여드려요. 담아둔 공고는 트래커리어
        앱에서도 볼 수 있어요.
      </p>
      <div className="grid">
        {rows.length ? (
          rows.map((item) => <RecruitmentCard key={item.id} item={item} />)
        ) : (
          <div className="empty">
            <h3>아직 저장한 공고가 없어요</h3>
            <p>공고 카드의 별을 누르면 여기에 쌓여요.</p>
            <Link href="/" className="btn brand">
              공고 보러 가기
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
