/**
 * 서버 `recruitments` 도메인의 응답 계약.
 * docs/backend-request-recruitment-catalog.md 의 API 스펙과 1:1로 맞춘다.
 * 서버 구현이 끝나면 이 타입은 그대로 두고 service 계층만 실 API로 바꾼다.
 */

export type EmploymentType = 'NEW_GRAD' | 'CONVERSION_INTERN' | 'EXPERIENCE_INTERN';

export const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  NEW_GRAD: '신입 정규직',
  CONVERSION_INTERN: '채용전환형 인턴',
  EXPERIENCE_INTERN: '체험형 인턴',
};

export const EMPLOYMENT_TYPE_SHORT: Record<EmploymentType, string> = {
  NEW_GRAD: '신입',
  CONVERSION_INTERN: '채용전환형',
  EXPERIENCE_INTERN: '체험형',
};

export interface CompanySummary {
  id: number;
  name: string;
  /** 카드·상세의 업종 표기. 예: `대기업 · 반도체` */
  industryLabel: string;
  brandColor: string;
  brandTextColor: string;
  logoUrl: string | null;
}

export interface RecruitmentRoleSummary {
  id: number;
  name: string;
  jobCategoryId: number;
  /** "하는 일" 한 줄 */
  summary: string;
}

export interface RecruitmentRoleDetail extends RecruitmentRoleSummary {
  /** "주요 업무" 목록 */
  details: string[];
  sortOrder: number;
}

export interface RecruitmentListItem {
  id: number;
  title: string;
  employmentType: EmploymentType;
  /** null = 마감 없음 */
  deadline: string | null;
  /** null = 마감 시각 미명시. 정렬 시 `23:59` 명시보다 뒤로 간다 */
  deadlineTime: string | null;
  closedOnHire: boolean;
  publishedAt: string;
  company: CompanySummary;
  roles: RecruitmentRoleSummary[];
  /** 비인증 요청에서는 항상 false */
  savedByMe: boolean;
}

export interface RecruitmentDetail extends Omit<RecruitmentListItem, 'roles'> {
  sourceUrl: string;
  notice: string | null;
  contentHtml: string | null;
  roles: RecruitmentRoleDetail[];
}

export interface CalendarRecruitment {
  id: number;
  title: string;
  deadline: string;
  deadlineTime: string | null;
  company: Pick<CompanySummary, 'name' | 'brandColor' | 'brandTextColor'>;
  savedByMe: boolean;
}

export interface JobCategory {
  id: number;
  name: string;
}

export interface JobCategoryGroup {
  groupName: string;
  categories: JobCategory[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
}

export type RecruitmentSort = 'latest' | 'deadline';

export interface RecruitmentListQuery {
  jobCategoryIds?: number[];
  deadlineWithinDays?: number;
  includeExpired?: boolean;
  sort?: RecruitmentSort;
  page?: number;
  limit?: number;
}
