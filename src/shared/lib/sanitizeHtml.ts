import sanitize from 'sanitize-html';

/**
 * 공고 원문(`contentHtml`) 정제.
 *
 * 1차 방어선은 서버가 저장 시점에 정제하는 것이고, 이건 렌더 시점의 이중 방어다.
 * 서버 컴포넌트에서만 호출해 sanitize-html이 클라이언트 번들에 들어가지 않게 한다.
 */
export const sanitizeContentHtml = (html: string): string =>
  sanitize(html, {
    allowedTags: [
      'h4',
      'h5',
      'h6',
      'p',
      'ul',
      'ol',
      'li',
      'strong',
      'b',
      'em',
      'i',
      'br',
      'hr',
      'div',
      'span',
      'a',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'blockquote',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      div: ['class'],
      span: ['class'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      // 원문 안의 외부 링크는 새 탭 + rel 고정
      a: sanitize.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
    },
  });
