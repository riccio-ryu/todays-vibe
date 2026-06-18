"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // 이미 설치(standalone)로 실행 중이면 숨김
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setHidden(true);
      return;
    }

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // standalone이면 숨김
  if (hidden) return null;
  // Android이면서 프롬프트 없으면 숨김 (iOS는 항상 표시)
  if (!isIOS && !deferredPrompt) return null;

  const handleClick = async () => {
    if (isIOS) {
      setShowIOSGuide((v) => !v);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setHidden(true);
    }
  };

  return (
    <div className="relative flex items-center">
      {/* iOS 가이드 팝오버 */}
      {showIOSGuide && (
        <>
          {/* 배경 오버레이 (탭으로 닫기) */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowIOSGuide(false)}
          />
          <div className="absolute right-0 top-10 z-50 w-56 rounded-xl bg-gray-900 border border-purple-500/40 shadow-xl p-3">
            <p className="text-white text-xs font-semibold mb-2">홈 화면에 추가하는 방법</p>
            <ol className="text-gray-300 text-xs space-y-1.5 leading-relaxed">
              <li>① 하단 공유 버튼 <span className="bg-gray-700 px-1 rounded text-white">□↑</span> 탭</li>
              <li>② <span className="text-purple-300 font-medium">"홈 화면에 추가"</span> 선택</li>
              <li>③ 오른쪽 위 <span className="text-purple-300 font-medium">"추가"</span> 탭</li>
            </ol>
            {/* 말풍선 꼬리 */}
            <div className="absolute -top-2 right-3 w-3 h-3 bg-gray-900 border-l border-t border-purple-500/40 rotate-45" />
          </div>
        </>
      )}

      {/* 아이콘 버튼 */}
      <button
        onClick={handleClick}
        className="relative group"
        aria-label="앱 설치"
      >
        {/* 다운로드 아이콘 */}
        <div className="w-7 h-7 flex items-center justify-center rounded-full bg-purple-600/20 border border-purple-400/30 group-hover:bg-purple-600/40 transition-colors">
          <Download className="w-3.5 h-3.5 text-purple-300" />
        </div>

        {/* 말풍선 — 헤더 아래로 absolute */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 flex flex-col items-center z-50 pointer-events-none">
          {/* 꼬리 */}
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-purple-600/90" />
          {/* 말풍선 본체 */}
          <span className="text-[11px] text-white bg-purple-600/90 border border-purple-400/40 px-2.5 py-1 rounded-lg leading-none whitespace-nowrap shadow-lg group-hover:bg-purple-500/90 transition-colors">
            앱으로 이용하기
          </span>
        </div>
      </button>
    </div>
  );
}
