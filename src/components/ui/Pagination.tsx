import { Fragment } from 'react';
import Link from 'next/link';
import styles from './Pagination.module.css';

interface Props {
  page: number;
  totalPages: number;
  /** 페이지 번호를 받아 링크 경로를 만든다 */
  buildHref: (page: number) => string;
}

/** 현재 페이지 기준 ±2 + 첫/끝 페이지를 노출한다. */
const visiblePages = (page: number, totalPages: number): number[] => {
  const pages = new Set([1, totalPages, page]);
  for (let delta = 1; delta <= 2; delta += 1) {
    if (page - delta >= 1) pages.add(page - delta);
    if (page + delta <= totalPages) pages.add(page + delta);
  }
  return [...pages].sort((a, b) => a - b);
};

/** 크롤러가 따라갈 수 있도록 링크로 렌더한다. */
export function Pagination({ page, totalPages, buildHref }: Props) {
  if (totalPages <= 1) return null;

  const pages = visiblePages(page, totalPages);
  // 건너뛴 구간에는 말줄임표를 끼운다
  const cells = pages.map((number, index) => ({
    number,
    gapBefore: index > 0 && number - pages[index - 1] > 1,
  }));

  return (
    <nav className={styles.pager} aria-label="페이지 이동">
      {page === 1 ? (
        <span className={styles.disabled}>‹ 이전</span>
      ) : (
        <Link href={buildHref(page - 1)} rel="prev">
          ‹ 이전
        </Link>
      )}

      {cells.map(({ number, gapBefore }) => (
        <Fragment key={number}>
          {gapBefore ? <span className={styles.gap}>…</span> : null}
          <Link href={buildHref(number)} aria-current={number === page ? 'page' : undefined}>
            {number}
          </Link>
        </Fragment>
      ))}

      {page === totalPages ? (
        <span className={styles.disabled}>다음 ›</span>
      ) : (
        <Link href={buildHref(page + 1)} rel="next">
          다음 ›
        </Link>
      )}
    </nav>
  );
}
