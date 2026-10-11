import { getCategoryIdByName } from './jobCategories';
import { RAW_POSTS, type RawPost } from './rawPosts';
import { getDayOfWeek, parseDateKey } from '@/shared/lib/date';
import type { CompanySummary, RecruitmentDetail } from '../model/types';

const pad = (n: number) => String(n).padStart(2, '0');

const companyNames = Array.from(new Set(RAW_POSTS.map((post) => post.company)));

const COMPANIES: CompanySummary[] = companyNames.map((name, index) => {
  const source = RAW_POSTS.find((post) => post.company === name) as RawPost;
  return {
    id: index + 1,
    name,
    industryLabel: source.industryLabel,
    brandColor: source.brandColor,
    brandTextColor: source.brandTextColor,
    logoUrl: null,
  };
});

const companyByName = new Map(COMPANIES.map((company) => [company.name, company]));

/**
 * 공고 원문 목업.
 * 실제로는 운영자가 어드민에서 입력한 `contentHtml`이 그대로 내려온다.
 */
const buildContentHtml = (post: RawPost): string => {
  const deadline = parseDateKey(post.deadline);
  const published = parseDateKey(post.publishedOn);
  const period =
    `${published.getFullYear()}.${pad(published.getMonth() + 1)}.${pad(published.getDate())}` +
    ` ~ ${deadline.getFullYear()}.${pad(deadline.getMonth() + 1)}.${pad(deadline.getDate())}` +
    `(${getDayOfWeek(deadline)})${post.deadlineTime ? ` ${post.deadlineTime}` : ''}까지`;

  const qualifications = {
    NEW_GRAD: [
      '2027년 2월 이전 졸업 예정자 또는 기졸업자',
      '병역을 마쳤거나 면제된 분 (해당자에 한함)',
      '해외여행에 결격 사유가 없는 분',
    ],
    CONVERSION_INTERN: [
      '재학생 또는 졸업 예정자 (인턴 기간 전일 근무 가능자)',
      '인턴 종료 후 정규직 전환 전형에 참여할 수 있는 분',
      '해외여행에 결격 사유가 없는 분',
    ],
    EXPERIENCE_INTERN: [
      '재학생 또는 졸업 예정자 (전 일정 참여 가능자)',
      '직무에 대한 관심과 학습 의지가 있는 분',
    ],
  }[post.employmentType];

  const process = {
    NEW_GRAD: [
      '서류 전형',
      '직무 적합성 평가',
      '1차 실무 면접',
      '2차 임원 면접',
      '채용 검진 및 최종 합격',
    ],
    CONVERSION_INTERN: ['서류 전형', '실무 면접', '인턴십 8주 수행', '전환 평가 및 최종 합격'],
    EXPERIENCE_INTERN: ['서류 전형', '실무 면접', '인턴십 수행 및 수료'],
  }[post.employmentType];

  const documents = [
    '입사지원서 (온라인 작성)',
    '최종 학교 성적증명서 1부',
    '졸업(예정) 증명서 1부',
    '공인 어학 성적표 1부 (보유 시)',
    '자격증 사본 (보유 시)',
  ];

  const list = (items: string[]) => `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;

  return [
    `<h4>지원 기간</h4><div class="rawbox"><p>${period}</p><p>※ 마감일 당시 지원자가 몰릴 수 있으니 미리 접수하는 것을 권장합니다.</p></div>`,
    '<h4>모집 분야 및 지원 자격</h4>',
    `<p>공통 지원 자격</p>${list(qualifications)}`,
    post.roles.map((r) => `<h5>${r.name}</h5><p>${r.summary}</p>${list(r.details)}`).join(''),
    `<h4>전형 절차</h4><ol>${process.map((step) => `<li>${step}</li>`).join('')}</ol>`,
    '<p>※ 전형 일정과 절차는 모집 분야에 따라 달라질 수 있습니다.</p>',
    `<h4>제출 서류</h4>${list(documents)}`,
    '<p>※ 제출 서류는 최종 면접 대상자에 한해 요청드립니다. 허위 기재 사실이 확인되면 합격이 취소될 수 있습니다.</p>',
    `<h4>기타 안내</h4>${list([
      ...(post.notice ? [post.notice] : []),
      '지원서에 기재한 내용이 사실과 다를 경우 합격이 취소될 수 있습니다.',
      '취업 보호 대상자와 장애인은 관계 법령에 따라 우대합니다.',
      '모집 분야별로 조기 마감될 수 있습니다.',
    ])}`,
    '<h4>문의</h4><div class="rawbox"><p>채용 관련 문의는 기업 채용 홈페이지의 문의 채널을 이용해 주세요.</p></div>',
  ].join('');
};

/** 목업 공고 전체. 서버 `GET /recruitments` 응답과 같은 형태다. */
export const MOCK_RECRUITMENTS: RecruitmentDetail[] = RAW_POSTS.map((post) => ({
  id: post.id,
  title: post.title,
  employmentType: post.employmentType,
  deadline: post.deadline,
  deadlineTime: post.deadlineTime || null,
  closedOnHire: false,
  publishedAt: `${post.publishedOn}T09:00:00+09:00`,
  company: companyByName.get(post.company) as CompanySummary,
  sourceUrl: post.sourceUrl,
  notice: post.notice || null,
  contentHtml: buildContentHtml(post),
  savedByMe: false,
  roles: post.roles.map((r, index) => ({
    id: post.id * 100 + index,
    name: r.name,
    jobCategoryId: getCategoryIdByName(r.name),
    summary: r.summary,
    details: r.details,
    sortOrder: index,
  })),
}));
