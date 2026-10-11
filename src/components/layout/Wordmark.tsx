/** trackareer 워드마크. 가운데 `a`만 브랜드 컬러로 강조한다. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      tr<i>a</i>ckareer
    </span>
  );
}
