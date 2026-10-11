import type { JobCategory, JobCategoryGroup } from '../model/types';

/**
 * 직무 분류 마스터 (대분류 7 / 소분류 26).
 * 서버 `job_category` 시드와 id·순서가 같아야 한다.
 * — docs/backend-request-recruitment-catalog.md §1-1
 */
export const JOB_CATEGORY_GROUPS: JobCategoryGroup[] = [
  {
    groupName: '경영·기획',
    categories: [
      { id: 1, name: '경영·전략기획' },
      { id: 2, name: '재무·회계' },
      { id: 3, name: 'HR·인사' },
      { id: 4, name: '사무지원·총무' },
      { id: 5, name: '법무·컴플라이언스' },
    ],
  },
  {
    groupName: '영업·마케팅',
    categories: [
      { id: 6, name: '영업·영업관리' },
      { id: 7, name: '마케팅·브랜딩' },
      { id: 8, name: '홍보·PR' },
      { id: 9, name: 'MD·커머스' },
      { id: 10, name: 'CS·CX' },
    ],
  },
  {
    groupName: '금융·컨설팅',
    categories: [
      { id: 11, name: '금융·투자' },
      { id: 12, name: '리서치·컨설팅' },
    ],
  },
  {
    groupName: 'IT·데이터',
    categories: [
      { id: 13, name: '소프트웨어 개발' },
      { id: 14, name: '데이터·AI' },
      { id: 15, name: '정보보안·IT인프라' },
      { id: 16, name: '서비스기획·PM' },
      { id: 17, name: '디자인' },
    ],
  },
  {
    groupName: '연구·엔지니어링',
    categories: [
      { id: 18, name: '전기·전자·반도체' },
      { id: 19, name: '기계·자동차' },
      { id: 20, name: '화학·소재' },
      { id: 21, name: '바이오·제약 연구' },
      { id: 22, name: '건설·토목·플랜트' },
    ],
  },
  {
    groupName: '생산·공급망',
    categories: [
      { id: 23, name: '생산·품질관리' },
      { id: 24, name: '구매·SCM·물류' },
      { id: 25, name: '환경·안전(EHS)' },
    ],
  },
  {
    groupName: '콘텐츠',
    categories: [{ id: 26, name: '콘텐츠·미디어' }],
  },
];

export const ALL_JOB_CATEGORIES: JobCategory[] = JOB_CATEGORY_GROUPS.flatMap(
  (group) => group.categories,
);

const byName = new Map(ALL_JOB_CATEGORIES.map((category) => [category.name, category]));
const byId = new Map(ALL_JOB_CATEGORIES.map((category) => [category.id, category]));

export const getCategoryIdByName = (name: string): number => {
  const category = byName.get(name);
  if (!category) throw new Error(`알 수 없는 직무 분류: ${name}`);
  return category.id;
};

export const getCategoryName = (id: number): string => byId.get(id)?.name ?? '';

export const getGroupNameByCategoryId = (id: number): string =>
  JOB_CATEGORY_GROUPS.find((group) => group.categories.some((c) => c.id === id))?.groupName ?? '';
