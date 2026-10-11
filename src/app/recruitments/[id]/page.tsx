import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRecruitment } from '@/features/recruitments/service/recruitmentService';
import { RawContent } from '@/features/recruitments/ui/RawContent';
import { RoleAccordion } from '@/features/recruitments/ui/RoleAccordion';
import { SaveActionButton } from '@/features/recruitments/ui/SaveActionButton';
import { EMPLOYMENT_TYPE_LABEL } from '@/features/recruitments/model/types';
import { getDdayLabel, getDeadlineText, isExpired } from '@/shared/lib/date';
import { sanitizeContentHtml } from '@/shared/lib/sanitizeHtml';
import { SITE_URL, RECRUITMENT_CATALOG_ENABLED } from '@/shared/config/site';
import styles from './detail.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ role?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!RECRUITMENT_CATALOG_ENABLED) return {};
  const { id } = await params;
  const post = await getRecruitment(Number(id));
  if (!post) return { title: '공고를 찾을 수 없어요' };

  const title = `${post.company.name} ${post.title}`;
  const description = `${getDeadlineText(post.deadline, post.deadlineTime)} · ${
    EMPLOYMENT_TYPE_LABEL[post.employmentType]
  } · 모집 직무 ${post.roles.length}개 (${post.roles.map((role) => role.name).join(', ')})`;

  return {
    title,
    description,
    alternates: { canonical: `/recruitments/${post.id}` },
    openGraph: { type: 'article', url: `/recruitments/${post.id}`, title, description },
  };
}

export default async function RecruitmentDetailPage({ params, searchParams }: PageProps) {
  if (!RECRUITMENT_CATALOG_ENABLED) notFound();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const post = await getRecruitment(Number(id));
  if (!post) notFound();

  const expired = isExpired(post.deadline);
  const initialRoleCategoryId = Number(query.role) || undefined;
  const contentHtml = post.contentHtml ? sanitizeContentHtml(post.contentHtml) : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: post.title,
    description: post.roles.map((role) => `${role.name}: ${role.summary}`).join(' / '),
    datePosted: post.publishedAt,
    ...(post.deadline ? { validThrough: post.deadline } : {}),
    employmentType: post.employmentType === 'NEW_GRAD' ? 'FULL_TIME' : 'INTERN',
    hiringOrganization: { '@type': 'Organization', name: post.company.name },
    identifier: { '@type': 'PropertyValue', name: post.company.name, value: String(post.id) },
    url: `${SITE_URL}/recruitments/${post.id}`,
    directApply: false,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="gutter">
        <div className={styles.crumb}>
          <Link href="/">← 공고 목록으로</Link>
        </div>

        <div className={styles.dhead}>
          <div className={styles.dtag}>
            <span className={`tag ${post.employmentType}`}>
              {EMPLOYMENT_TYPE_LABEL[post.employmentType]}
            </span>
            <span className="tag biz">{post.company.industryLabel}</span>
          </div>
          <h1 className={styles.dtitle}>
            {post.company.name}
            <span className={styles.bar}>｜</span>
            {post.title}
          </h1>
        </div>

        <div className={styles.layout}>
          <div>
            {expired ? (
              <p className={styles.callout}>
                접수가 끝난 공고예요. 일정이 바뀌었을 수도 있으니 원문에서 한 번 더 확인해보세요.
              </p>
            ) : null}

            <section className="sec" style={{ paddingTop: 0 }}>
              <div className="sechead">
                <span className="em" aria-hidden="true">
                  🧩
                </span>
                <h2>모집 직무 {post.roles.length}개</h2>
              </div>
              <p className="seclede">
                이 공고에서는 직무 하나를 골라 지원해요. 자세한 조건은 아래 원문에 있어요.
              </p>
              <RoleAccordion roles={post.roles} initialOpenCategoryId={initialRoleCategoryId} />
            </section>

            {post.notice ? (
              <section className="sec">
                <div className="sechead">
                  <span className="em" aria-hidden="true">
                    📌
                  </span>
                  <h2>지원 전에 확인해요</h2>
                </div>
                <p className={styles.memo}>{post.notice}</p>
              </section>
            ) : null}

            <section className={`sec ${styles.lastPad}`}>
              <div className="sechead">
                <span className="em" aria-hidden="true">
                  📄
                </span>
                <h2>공고 원문</h2>
              </div>
              <p className="seclede">기업이 공지한 내용을 그대로 옮겼어요.</p>

              {contentHtml ? (
                <RawContent html={contentHtml} />
              ) : (
                <p className={styles.memo}>
                  등록된 원문이 없어요. 기업 채용 페이지에서 확인해주세요.
                </p>
              )}

              <div className={styles.srcbar}>
                <p>
                  <b>원문은 기업 채용 홈페이지에서 확인할 수 있어요</b>
                  지원 접수도 원문 페이지에서 진행돼요.
                </p>
                <a
                  className={`btnLg ${expired ? 'ghost' : 'brand'}`}
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {expired ? '원문 확인하기' : '공고 원문으로 지원하기'}
                </a>
              </div>
            </section>
          </div>

          <aside className={styles.side}>
            <div className={styles.sidecard}>
              <div className={styles.shead}>
                <div
                  className={styles.slogo}
                  style={{
                    background: post.company.brandColor,
                    color: post.company.brandTextColor,
                  }}
                >
                  {post.company.name}
                </div>
                <div>
                  <div className={styles.scorp}>{post.company.name}</div>
                  <div className={styles.sbiz}>{post.company.industryLabel}</div>
                </div>
              </div>

              <div className={styles.sbody}>
                <div className={`${styles.sdd} ${expired ? styles.over : ''}`}>
                  <span className={`${styles.big} num`}>{getDdayLabel(post.deadline)}</span>
                  <span className={styles.sub}>
                    {getDeadlineText(post.deadline, post.deadlineTime)}
                  </span>
                </div>

                <dl className={styles.sfacts}>
                  <div className={styles.sfact}>
                    <dt>채용 유형</dt>
                    <dd>{EMPLOYMENT_TYPE_LABEL[post.employmentType]}</dd>
                  </div>
                  <div className={styles.sfact}>
                    <dt>모집 직무</dt>
                    <dd>{post.roles.length}개</dd>
                  </div>
                  <div className={styles.sfact}>
                    <dt>등록일</dt>
                    <dd>{post.publishedAt.slice(0, 10).replace(/-/g, '.')}</dd>
                  </div>
                </dl>

                <div className={styles.sacts}>
                  <a
                    className={`btnLg ${expired ? 'ghost' : 'brand'}`}
                    href={post.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {expired ? '원문 확인하기' : '공고 원문으로 지원하기'}
                  </a>
                  <SaveActionButton recruitmentId={post.id} />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
