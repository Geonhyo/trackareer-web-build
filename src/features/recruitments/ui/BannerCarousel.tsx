'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { APP_DOWNLOAD_PATH } from '@/shared/config/site';
import { getDday, getDdayLabel, getDeadlineText, parseDateKey } from '@/shared/lib/date';
import type { RecruitmentListItem } from '../model/types';
import styles from './BannerCarousel.module.css';

const AUTO_ADVANCE_MS = 6500;
const pad = (n: number) => String(n).padStart(2, '0');

interface Props {
  /** 배너로 띄울 공고. 목록 페이지가 마감 임박순 상위를 넘겨준다 */
  featured: RecruitmentListItem[];
}

export function BannerCarousel({ featured }: Props) {
  const slideCount = featured.length + 1;
  const [index, setIndex] = useState(0);

  const move = useCallback(
    (delta: number) => setIndex((current) => (current + delta + slideCount) % slideCount),
    [slideCount],
  );

  useEffect(() => {
    if (slideCount <= 1) return;
    const timer = window.setInterval(() => move(1), AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [move, slideCount]);

  return (
    <div className={styles.wrap}>
      <div className={styles.view}>
        <div className={styles.track} style={{ transform: `translateX(${-100 * index}%)` }}>
          <AppBanner />
          {featured.map((item) => (
            <PostBanner key={item.id} item={item} />
          ))}
        </div>
      </div>

      {slideCount > 1 ? (
        <>
          <button
            type="button"
            className={`${styles.arw} ${styles.prev}`}
            aria-label="이전 배너"
            onClick={() => move(-1)}
          >
            ‹
          </button>
          <button
            type="button"
            className={`${styles.arw} ${styles.next}`}
            aria-label="다음 배너"
            onClick={() => move(1)}
          >
            ›
          </button>
          <div className={styles.dots}>
            {Array.from({ length: slideCount }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`${i + 1}번 배너`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function AppBanner() {
  return (
    <div
      className={styles.bn}
      style={{ background: 'linear-gradient(104deg,#3A73EC 0%,#2148A8 100%)' }}
    >
      <div className={styles.glow} />
      <div className={styles.copy}>
        <div className={styles.kick}>
          <span>trackareer 앱</span>
        </div>
        <h3>마감일은 저희가 챙길게요</h3>
        <p>trackareer 앱에 관심 공고를 담아두면 마감 전에 알림으로 알려드려요</p>
        <Link href={APP_DOWNLOAD_PATH} className={`${styles.cta} ${styles.link}`}>
          앱 다운로드 →
        </Link>
      </div>
      <div className={styles.art}>
        <div className={styles.notis}>
          <div className={`${styles.noti} ${styles.a}`}>
            <div className={styles.ico}>t</div>
            <div className={styles.tx}>
              <div className={styles.t1}>trackareer · 지금</div>
              <div className={styles.t2}>담아둔 공고, 내일 마감이에요</div>
            </div>
            <span className={styles.pin}>D-1</span>
          </div>
          <div className={`${styles.noti} ${styles.b}`}>
            <div className={styles.ico}>t</div>
            <div className={styles.tx}>
              <div className={styles.t1}>trackareer · 어제</div>
              <div className={styles.t2}>이번 주 마감 공고가 3건 있어요</div>
            </div>
            <span className={`${styles.pin} ${styles.blue}`}>확인</span>
          </div>
        </div>
      </div>
      <div className={styles.wmk}>trackareer</div>
    </div>
  );
}

function PostBanner({ item }: { item: RecruitmentListItem }) {
  const dday = getDday(item.deadline);
  const deadlineDate = item.deadline ? parseDateKey(item.deadline) : null;

  return (
    <div
      className={styles.bn}
      style={{
        background: `linear-gradient(104deg, ${item.company.brandColor} 0%, rgba(12,14,20,.82) 126%)`,
      }}
    >
      <div className={styles.glow} />
      <div className={styles.copy}>
        <div className={styles.kick}>
          <span>주요 공고</span>
          <span>{item.company.industryLabel}</span>
          {dday !== null && dday >= 0 && dday <= 3 ? (
            <span className={styles.hot}>{dday === 0 ? '오늘 마감' : `마감 D-${dday}`}</span>
          ) : null}
        </div>
        <h3>
          {item.company.name}｜{item.title}
        </h3>
        <p>
          {getDeadlineText(item.deadline, item.deadlineTime)} · 직무 {item.roles.length}개를 뽑아요
        </p>
        <Link href={`/recruitments/${item.id}`} className={`${styles.cta} ${styles.link}`}>
          공고 보러가기 →
        </Link>
      </div>
      <div className={styles.art}>
        <div className={styles.ring}>
          <div className={`${styles.rn} num`}>
            {dday === 0 ? 'D-DAY' : getDdayLabel(item.deadline)}
          </div>
          {deadlineDate ? (
            <div className={styles.rl}>
              {pad(deadlineDate.getMonth() + 1)}.{pad(deadlineDate.getDate())} 마감
            </div>
          ) : null}
        </div>
      </div>
      <div className={styles.wmk}>{item.company.name}</div>
    </div>
  );
}
