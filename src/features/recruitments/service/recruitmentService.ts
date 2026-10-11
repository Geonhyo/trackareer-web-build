import { JOB_CATEGORY_GROUPS } from '../mock/jobCategories';
import { MOCK_RECRUITMENTS } from '../mock/recruitments';
import {
  compareByDeadline,
  compareByPublishedAt,
  getDday,
  isExpired,
  parseDateKey,
} from '@/shared/lib/date';
import type {
  CalendarRecruitment,
  JobCategoryGroup,
  Paginated,
  RecruitmentDetail,
  RecruitmentListItem,
  RecruitmentListQuery,
} from '../model/types';

/**
 * 공고 조회 경계.
 *
 * 지금은 목업 데이터를 돌려주지만 시그니처는 서버 API와 1:1로 맞춰 뒀다.
 * (docs/backend-request-recruitment-catalog.md §3-1)
 * 서버가 열리면 이 파일의 본문만 fetch 호출로 바꾸면 되고 화면은 건드리지 않는다.
 */

export const DEFAULT_PAGE_SIZE = 8;
/** 목록 상단 "이번 주 놓치면 안 되는 공고" 기준 */
export const URGENT_WITHIN_DAYS = 7;
export const URGENT_LIMIT = 4;

const toListItem = (post: RecruitmentDetail): RecruitmentListItem => ({
  id: post.id,
  title: post.title,
  employmentType: post.employmentType,
  deadline: post.deadline,
  deadlineTime: post.deadlineTime,
  closedOnHire: post.closedOnHire,
  publishedAt: post.publishedAt,
  company: post.company,
  savedByMe: post.savedByMe,
  roles: post.roles.map(({ id, name, jobCategoryId, summary }) => ({
    id,
    name,
    jobCategoryId,
    summary,
  })),
});

/** `GET /recruitments` */
export async function getRecruitments(
  query: RecruitmentListQuery = {},
): Promise<Paginated<RecruitmentListItem>> {
  const {
    jobCategoryIds,
    deadlineWithinDays,
    includeExpired = false,
    sort = 'latest',
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
  } = query;

  let rows = MOCK_RECRUITMENTS.filter((post) => includeExpired || !isExpired(post.deadline));

  if (deadlineWithinDays !== undefined) {
    rows = rows.filter((post) => {
      const dday = getDday(post.deadline);
      return dday !== null && dday >= 0 && dday <= deadlineWithinDays;
    });
  }

  if (jobCategoryIds?.length) {
    const wanted = new Set(jobCategoryIds);
    rows = rows.filter((post) => post.roles.some((role) => wanted.has(role.jobCategoryId)));
  }

  rows = [...rows].sort(sort === 'deadline' ? compareByDeadline : compareByPublishedAt);

  const total = rows.length;
  const from = (page - 1) * limit;
  return { items: rows.slice(from, from + limit).map(toListItem), total };
}

/** `GET /recruitments/:id` */
export async function getRecruitment(id: number): Promise<RecruitmentDetail | null> {
  return MOCK_RECRUITMENTS.find((post) => post.id === id) ?? null;
}

/** `GET /recruitments/calendar` — 마감 경과분도 포함한다 */
export async function getCalendarRecruitments(
  year: number,
  month: number,
): Promise<CalendarRecruitment[]> {
  return MOCK_RECRUITMENTS.filter((post) => {
    if (!post.deadline) return false;
    const date = parseDateKey(post.deadline);
    return date.getFullYear() === year && date.getMonth() === month;
  })
    .sort(compareByDeadline)
    .map((post) => ({
      id: post.id,
      title: post.title,
      deadline: post.deadline as string,
      deadlineTime: post.deadlineTime,
      company: {
        name: post.company.name,
        brandColor: post.company.brandColor,
        brandTextColor: post.company.brandTextColor,
      },
      savedByMe: post.savedByMe,
    }));
}

/** `GET /job-categories` */
export async function getJobCategoryGroups(): Promise<JobCategoryGroup[]> {
  return JOB_CATEGORY_GROUPS;
}

/**
 * `GET /me/saved-recruitments`
 * 관심 공고는 마감 임박순이고 마감 경과분도 포함한다.
 */
export async function getRecruitmentsByIds(ids: number[]): Promise<RecruitmentListItem[]> {
  const wanted = new Set(ids);
  return MOCK_RECRUITMENTS.filter((post) => wanted.has(post.id))
    .sort(compareByDeadline)
    .map(toListItem);
}
