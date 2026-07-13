/**
 * 현재 페이지 URL을 Web Share API로 공유한다.
 * 미지원 브라우저는 클립보드 복사로 폴백.
 */
export function shareOrCopyUrl(title: string, text?: string): void {
  if (navigator.share) {
    navigator.share({ title, ...(text ? { text } : {}), url: window.location.href })
      .catch((e) => { if (e?.name !== "AbortError") throw e; });
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert("링크가 클립보드에 복사됐어요!");
  }
}
