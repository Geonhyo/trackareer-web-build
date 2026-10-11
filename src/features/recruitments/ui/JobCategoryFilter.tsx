'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { JobCategoryGroup } from '../model/types';
import styles from './JobCategoryFilter.module.css';

interface Props {
  groups: JobCategoryGroup[];
  selectedIds: number[];
}

/** 선택 직무는 URL(`?jobs=13,14`)에 둔다 — 공유·뒤로가기·SSR이 모두 같은 결과를 낸다. */
export function JobCategoryFilter({ groups, selectedIds }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(false);

  const apply = (nextIds: number[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextIds.length) params.set('jobs', nextIds.join(','));
    else params.delete('jobs');
    params.delete('page'); // 필터가 바뀌면 1페이지로
    const query = params.toString();
    router.push(query ? `/?${query}` : '/', { scroll: false });
  };

  const toggle = (id: number) =>
    apply(
      selectedIds.includes(id) ? selectedIds.filter((sel) => sel !== id) : [...selectedIds, id],
    );

  return (
    <div className={styles.bar}>
      <div className={`${styles.cloud} ${expanded ? styles.open : ''}`}>
        <button
          type="button"
          className={`${styles.chip} ${styles.all}`}
          aria-pressed={selectedIds.length === 0}
          onClick={() => apply([])}
        >
          전체보기
        </button>
        {groups.flatMap((group) =>
          group.categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={styles.chip}
              aria-pressed={selectedIds.includes(category.id)}
              onClick={() => toggle(category.id)}
            >
              {category.name}
            </button>
          )),
        )}
      </div>
      <button type="button" className={styles.more} onClick={() => setExpanded((open) => !open)}>
        {expanded ? '접기' : '직무 전체 보기'}
      </button>
    </div>
  );
}
