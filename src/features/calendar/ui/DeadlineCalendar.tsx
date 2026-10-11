'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSaved } from '@/features/saved/ui/SavedProvider';
import { useSession } from '@/features/auth/ui/SessionProvider';
import {
  getCalendarStart,
  getDday,
  getFullDateText,
  isExpired,
  parseDateKey,
  toDateKey,
  todayInSeoul,
} from '@/shared/lib/date';
import type { CalendarRecruitment } from '@/features/recruitments/model/types';
import styles from './DeadlineCalendar.module.css';

const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const CELL_COUNT = 42;
const MAX_EVENTS_PER_CELL = 3;

type Scope = 'all' | 'saved';

interface Props {
  year: number;
  /** 0-based */
  month: number;
  items: CalendarRecruitment[];
  initialSelectedDate: string;
}

const monthHref = (year: number, month: number, date?: string) => {
  const params = new URLSearchParams({ y: String(year), m: String(month + 1) });
  if (date) params.set('d', date);
  return `/calendar?${params.toString()}`;
};

export function DeadlineCalendar({ year, month, items, initialSelectedDate }: Props) {
  const router = useRouter();
  const { requireLogin } = useSession();
  const { isSaved } = useSaved();
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [scope, setScope] = useState<Scope>('all');

  const today = todayInSeoul();
  const todayKey = toDateKey(today);
  const visible = scope === 'saved' ? items.filter((item) => isSaved(item.id)) : items;

  const byDate = new Map<string, CalendarRecruitment[]>();
  visible.forEach((item) => {
    const list = byDate.get(item.deadline);
    if (list) list.push(item);
    else byDate.set(item.deadline, [item]);
  });

  const start = getCalendarStart(year, month);
  const selectedItems = byDate.get(selectedDate) ?? [];
  const selected = parseDateKey(selectedDate);

  const changeScope = (next: Scope) => {
    if (next === 'saved' && !requireLogin()) return;
    setScope(next);
  };

  return (
    <>
      <div className={styles.bar}>
        <div className={styles.monthnav}>
          <Link
            className={styles.arw}
            href={monthHref(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1)}
            aria-label="이전 달"
            scroll={false}
          >
            ‹
          </Link>
          <span className={`${styles.mm} num`}>
            {year}년 {month + 1}월
          </span>
          <Link
            className={styles.arw}
            href={monthHref(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1)}
            aria-label="다음 달"
            scroll={false}
          >
            ›
          </Link>
        </div>
        <Link
          className="btn neutral"
          href={monthHref(today.getFullYear(), today.getMonth(), todayKey)}
          scroll={false}
        >
          오늘
        </Link>

        <div className={styles.seg} role="group" aria-label="공고 범위">
          <button type="button" aria-pressed={scope === 'all'} onClick={() => changeScope('all')}>
            전체 공고
          </button>
          <button
            type="button"
            aria-pressed={scope === 'saved'}
            onClick={() => changeScope('saved')}
          >
            관심 공고
          </button>
        </div>
      </div>

      <div className={styles.wrap}>
        <div className={styles.grid}>
          <div className={styles.dow}>
            {DOW.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className={styles.days}>
            {Array.from({ length: CELL_COUNT }, (_, index) => {
              const date = new Date(start);
              date.setDate(start.getDate() + index);
              const key = toDateKey(date);
              const outside = date.getMonth() !== month;
              const events = outside ? [] : (byDate.get(key) ?? []);

              return (
                <button
                  type="button"
                  key={key}
                  className={[
                    styles.day,
                    outside ? styles.out : '',
                    key === todayKey ? styles.today : '',
                    key === selectedDate ? styles.selected : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    if (outside) {
                      router.push(monthHref(date.getFullYear(), date.getMonth(), key), {
                        scroll: false,
                      });
                      return;
                    }
                    setSelectedDate(key);
                  }}
                >
                  <span className={`${styles.dnum} num`}>{date.getDate()}</span>
                  {events.slice(0, MAX_EVENTS_PER_CELL).map((event) => {
                    const dday = getDday(event.deadline, today);
                    const past = isExpired(event.deadline, today);
                    const urgent = !past && dday !== null && dday <= 3;
                    return (
                      <span
                        key={event.id}
                        className={[styles.ev, past ? styles.past : '', urgent ? styles.urgent : '']
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <span className={styles.dot} />
                        <span className={styles.evName}>{event.company.name}</span>
                      </span>
                    );
                  })}
                  {events.length > MAX_EVENTS_PER_CELL ? (
                    <span className={styles.evmore}>+{events.length - MAX_EVENTS_PER_CELL}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <aside className={styles.panel}>
          <h3 className={styles.panelDate}>{getFullDateText(selected)}</h3>
          <p className={styles.panelSub}>
            {selectedItems.length
              ? `이 날 ${selectedItems.length}개가 마감돼요`
              : '마감되는 공고가 없어요'}
          </p>

          {selectedItems.length ? (
            selectedItems.map((item) => (
              <Link key={item.id} href={`/recruitments/${item.id}`} className={styles.item}>
                <span
                  className={styles.mini}
                  style={{
                    background: item.company.brandColor,
                    color: item.company.brandTextColor,
                  }}
                >
                  {item.company.name}
                </span>
                <span>
                  <span className={`${styles.time} ${item.deadlineTime ? '' : styles.none}`}>
                    {item.deadlineTime ? `${item.deadlineTime.slice(0, 5)} 마감` : '시간 미정'}
                  </span>
                  <span className={styles.itemTitle} style={{ display: 'block' }}>
                    {item.company.name}｜{item.title}
                  </span>
                  {isExpired(item.deadline, today) ? (
                    <span className={`${styles.flag} ${styles.over}`}>마감됐어요</span>
                  ) : isSaved(item.id) ? (
                    <span className={`${styles.flag} ${styles.save}`}>관심 등록</span>
                  ) : null}
                </span>
              </Link>
            ))
          ) : (
            <div className={styles.panelEmpty}>
              {scope === 'saved' ? '이 날 마감되는 관심 공고가 없어요' : '다른 날짜를 눌러보세요'}
            </div>
          )}

          <div className={styles.adslot}>광고 영역</div>
        </aside>
      </div>
    </>
  );
}
