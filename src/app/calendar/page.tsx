import type { Metadata } from 'next';
import { DeadlineCalendar } from '@/features/calendar/ui/DeadlineCalendar';
import { getCalendarRecruitments } from '@/features/recruitments/service/recruitmentService';
import { toDateKey, todayInSeoul } from '@/shared/lib/date';

export const metadata: Metadata = {
  title: '마감 캘린더',
  description: '등록된 신입·인턴 채용 공고의 마감일을 달력으로 한눈에 확인하세요.',
  alternates: { canonical: '/calendar' },
};

interface PageProps {
  searchParams: Promise<{ y?: string; m?: string; d?: string }>;
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const today = todayInSeoul();

  const year = Number(params.y) || today.getFullYear();
  const monthParam = Number(params.m);
  // 쿼리는 1~12, 내부는 0-based
  const month = monthParam >= 1 && monthParam <= 12 ? monthParam - 1 : today.getMonth();

  const items = await getCalendarRecruitments(year, month);
  const selectedDate =
    params.d && /^\d{4}-\d{2}-\d{2}$/.test(params.d)
      ? params.d
      : year === today.getFullYear() && month === today.getMonth()
        ? toDateKey(today)
        : toDateKey(new Date(year, month, 1));

  return (
    <div className="gutter">
      <section className="sec" style={{ paddingBottom: 'var(--x12)' }}>
        <div className="sechead">
          <span className="em" aria-hidden="true">
            📅
          </span>
          <h2>마감 캘린더</h2>
        </div>
        <p className="seclede">등록된 공고의 마감일을 달력으로 한눈에 확인해요.</p>

        <DeadlineCalendar
          key={`${year}-${month}`}
          year={year}
          month={month}
          items={items}
          initialSelectedDate={selectedDate}
        />
      </section>
    </div>
  );
}
