"use client";

import Link from "next/link";
import { useState } from "react";

interface Props {
  /** night = 어두운 운세 테마(기본), day = 밝은 심테 테마 */
  variant?: "night" | "day";
}

export default function Footer({ variant = "night" }: Props) {
  const [open, setOpen] = useState(false);
  const day = variant === "day";

  const c = {
    border: day ? "border-slate-300/70" : "border-white/8",
    toggle: day
      ? "text-slate-500 hover:text-slate-700"
      : "text-[#a8a6b7]/40 hover:text-[#a8a6b7]",
    box: day ? "bg-white/50 border-slate-300/70" : "bg-white/4 border-white/8",
    boxText: day ? "text-slate-500" : "text-[#a8a6b7]/60",
    boxStrong: day ? "text-slate-700" : "text-[#f4f0ff]/70",
    link: day ? "text-slate-500" : "text-[#a8a6b7]/50",
    linkHover: day ? "hover:text-slate-800" : "hover:text-[#f4f0ff]",
    dot: day ? "text-slate-400" : "text-[#a8a6b7]/25",
    copy: day ? "text-slate-400" : "text-[#a8a6b7]/30",
  };

  return (
    <footer className={`mt-auto border-t ${c.border}`}>
      {/* 접힌 상태 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-center gap-2 py-3 text-xs transition-colors ${c.toggle}`}
      >
        <span>© 2026 오늘운</span>
        <span className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>∨</span>
      </button>

      {/* 펼친 상태 */}
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-6 pb-8 space-y-6 max-w-xl mx-auto">

          {/* 면책조항 */}
          <div className={`rounded-2xl border px-4 py-3 ${c.box}`}>
            <p className={`text-[11px] leading-relaxed ${c.boxText}`}>
              본 서비스의 AI 운세 해석은 <span className={c.boxStrong}>재미와 참고 목적</span>으로 제공됩니다.
              실제 의사결정, 투자, 건강, 법률 등 중요한 사안에 활용하지 마세요.
              운세 결과는 개인의 상황에 따라 다를 수 있습니다.
            </p>
          </div>

          {/* 링크 */}
          <div className={`flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs ${c.link}`}>
            <Link href="/about" className={`${c.linkHover} transition-colors`}>서비스 소개</Link>
            <span className={c.dot}>·</span>
            <Link href="/terms" className={`${c.linkHover} transition-colors`}>이용약관</Link>
            <span className={c.dot}>·</span>
            <Link href="/privacy" className={`${c.linkHover} transition-colors`}>개인정보처리방침</Link>
            <span className={c.dot}>·</span>
            <a href="mailto:ters9292@gmail.com" className={`${c.linkHover} transition-colors`}>문의하기</a>
            <span className={c.dot}>·</span>
            <a href="https://github.com/riccio-ryu/todays-vibe" target="_blank" rel="noopener noreferrer" className={`${c.linkHover} transition-colors`}>GitHub</a>
          </div>

          <p className={`text-center text-[11px] ${c.copy}`}>© 2026 오늘운 · All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
