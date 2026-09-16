"use client";

import { useEffect, useState } from "react";

export default function IOSInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches;
    const dismissed = sessionStorage.getItem("ios-banner-dismissed");

    if (isIOS && !isInStandaloneMode && !dismissed) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const handleDismiss = () => {
    sessionStorage.setItem("ios-banner-dismissed", "1");
    setShow(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900/95 backdrop-blur border-t border-purple-800/50 shadow-2xl">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-4 text-gray-400 hover:text-white text-lg leading-none"
        aria-label="닫기"
      >
        ✕
      </button>
      <div className="flex items-start gap-3 pr-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/icon-192x192.png"
          alt="오늘운 아이콘"
          className="w-12 h-12 rounded-2xl flex-shrink-0"
        />
        <div>
          <p className="text-white font-medium text-sm mb-1">홈 화면에 추가하기</p>
          <p className="text-gray-300 text-xs leading-relaxed">
            하단 공유 버튼{" "}
            <span className="inline-block bg-gray-700 rounded px-1 py-0.5 text-white">□↑</span>
            을 누른 후{" "}
            <span className="font-semibold text-purple-300">"홈 화면에 추가"</span>
            를 선택하세요
          </p>
        </div>
      </div>
    </div>
  );
}
