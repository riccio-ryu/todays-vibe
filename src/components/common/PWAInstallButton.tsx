"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PopoverStyle {
  top: number;
  left: number;
  tailLeft: number;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<PopoverStyle | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
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

  if (hidden) return null;
  if (!isIOS && !deferredPrompt) return null;

  const handleClick = async () => {
    if (isIOS) {
      if (!showIOSGuide && btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        const POPOVER_W = 224; // w-56
        const MARGIN = 12;
        const rawLeft = rect.left + rect.width / 2 - POPOVER_W / 2;
        const left = Math.max(MARGIN, Math.min(window.innerWidth - POPOVER_W - MARGIN, rawLeft));
        const tailLeft = rect.left + rect.width / 2 - left;
        setPopoverStyle({ top: rect.bottom + 8, left, tailLeft });
      }
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
      {showIOSGuide && popoverStyle && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowIOSGuide(false)} />
          <div
            className="fixed z-50 w-56 rounded-xl bg-gray-900 border border-purple-500/40 shadow-xl p-3"
            style={{ top: popoverStyle.top, left: popoverStyle.left }}
          >
            {/* 말풍선 꼬리 */}
            <div
              className="absolute -top-2 w-3 h-3 -translate-x-1/2 bg-gray-900 border-l border-t border-purple-500/40 rotate-45"
              style={{ left: popoverStyle.tailLeft }}
            />
            <p className="text-white text-xs font-semibold mb-2">홈 화면에 추가하는 방법</p>
            <ol className="text-gray-300 text-xs space-y-1.5 leading-relaxed">
              <li>① 하단 공유 버튼 <span className="bg-gray-700 px-1 rounded text-white">□↑</span> 탭</li>
              <li>② <span className="text-purple-300 font-medium">"홈 화면에 추가"</span> 선택</li>
              <li>③ 오른쪽 위 <span className="text-purple-300 font-medium">"추가"</span> 탭</li>
            </ol>
          </div>
        </>
      )}

      {/* 아이콘 버튼 */}
      <button
        ref={btnRef}
        onClick={handleClick}
        className="relative group"
        aria-label="앱 설치"
      >
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
