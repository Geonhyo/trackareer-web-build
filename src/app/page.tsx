import type { Metadata } from 'next';
import Link from 'next/link';
import { AppDownload, APP_DOWNLOAD_LEDE } from '@/features/app-download/ui/AppDownload';
import { BannerCarousel } from '@/features/recruitments/ui/BannerCarousel';
import { JobCategoryFilter } from '@/features/recruitments/ui/JobCategoryFilter';
import { RecruitmentCard } from '@/features/recruitments/ui/RecruitmentCard';
import { Pagination } from '@/components/ui/Pagination';
import {
  DEFAULT_PAGE_SIZE,
  URGENT_LIMIT,
  URGENT_WITHIN_DAYS,
  getJobCategoryGroups,
  getRecruitments,
} from '@/features/recruitments/service/recruitmentService';
import { getDdayLabel } from '@/shared/lib/date';
import {
  BUSINESS_EMAIL,
  OG_IMAGE,
  RECRUITMENT_CATALOG_ENABLED,
  SITE_NAME,
} from '@/shared/config/site';
import styles from './page.module.css';

const BANNER_FEATURED_LIMIT = 3;

/** 공고 화면이 꺼져 있으면 홈은 앱 소개라 제목·설명도 앱 기준으로 바꾼다 */
export const metadata: Metadata | undefined = RECRUITMENT_CATALOG_ENABLED
  ? undefined
  : {
      title: { absolute: `${SITE_NAME} | 취준 일정 관리 앱` },
      description: APP_DOWNLOAD_LEDE,
      openGraph: {
        title: `${SITE_NAME} | 취준 일정 관리 앱`,
        description: APP_DOWNLOAD_LEDE,
        images: [OG_IMAGE],
      },
    };

interface PageProps {
  searchParams: Promise<{ jobs?: string; page?: string }>;
}

const parseIds = (value?: string): number[] =>
  (value ?? '')
    .split(',')
    .map((part) => Number(part))
    .filter((id) => Number.isInteger(id) && id > 0);

const buildHref = (jobs: number[], page: number): string => {
  const params = new URLSearchParams();
  if (jobs.length) params.set('jobs', jobs.join(','));
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/?${query}` : '/';
};

export default async function RecruitmentListPage({ searchParams }: PageProps) {
  if (!RECRUITMENT_CATALOG_ENABLED) return <AppDownload />;

  const params = await searchParams;
  const jobCategoryIds = parseIds(params.jobs);
  const page = Math.max(1, Number(params.page) || 1);

  const [urgent, list, categoryGroups] = await Promise.all([
    getRecruitments({
      deadlineWithinDays: URGENT_WITHIN_DAYS,
      sort: 'deadline',
      limit: URGENT_LIMIT,
    }),
    getRecruitments({ jobCategoryIds, sort: 'latest', page, limit: DEFAULT_PAGE_SIZE }),
    getJobCategoryGroups(),
  ]);

  const totalPages = Math.max(1, Math.ceil(list.total / DEFAULT_PAGE_SIZE));

  return (
    <>
      <BannerCarousel featured={urgent.items.slice(0, BANNER_FEATURED_LIMIT)} />

      <div className="gutter">
        {urgent.items.length > 0 ? (
          <section className="sec">
            <div className="sechead">
              <span className="em" aria-hidden="true">
                🔥
              </span>
              <h2>이번 주 놓치면 안 되는 공고</h2>
              <div className="acts">
                <Link href="/calendar" className="btn neutral">
                  마감 캘린더 보기
                </Link>
              </div>
            </div>
            <p className="seclede">
              {URGENT_WITHIN_DAYS}일 안에 마감돼요. 가장 급한 건 {urgent.items[0].company.name}{' '}
              {getDdayLabel(urgent.items[0].deadline)}이에요.
            </p>
            <div className="grid">
              {urgent.items.map((item) => (
                <RecruitmentCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="sec">
          <div className="sechead">
            <span className="em" aria-hidden="true">
              🎓
            </span>
            <h2>신입 · 인턴 채용 공고</h2>
          </div>
          <p className="seclede">
            {jobCategoryIds.length
              ? `선택한 직무를 뽑는 공고 ${list.total}개를 최근 등록순으로 보여드려요.`
              : `지금 지원할 수 있는 공고 ${list.total}개를 최근 등록순으로 보여드려요.`}
          </p>

          <JobCategoryFilter groups={categoryGroups} selectedIds={jobCategoryIds} />

          <div className="grid">
            {list.items.length ? (
              list.items.map((item) => (
                <RecruitmentCard key={item.id} item={item} highlightCategoryIds={jobCategoryIds} />
              ))
            ) : (
              <div className="empty">
                <h3>이 직무의 공고가 아직 없어요</h3>
                <p>다른 직무를 골라보거나 전체보기로 확인해보세요.</p>
                <Link href="/" className="btn brand">
                  전체보기
                </Link>
              </div>
            )}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            buildHref={(next) => buildHref(jobCategoryIds, next)}
          />
        </section>

        <div className={styles.inq}>
          <p>채용공고를 등록하거나 마케팅을 문의하고 싶으세요?</p>
          <a
            className="btn brand"
            href={`mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent('[트래커리어] 채용공고 등록·제휴 문의')}`}
          >
            문의하기
          </a>
        </div>
      </div>
    </>
  );
}
