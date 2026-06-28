"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [open, setOpen] = useState(false);

  return (
    <footer className="mt-auto border-t border-white/8">
      {/* 접힌 상태 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-center gap-2 py-3 text-[#a8a6b7]/40 hover:text-[#a8a6b7] text-xs transition-colors"
      >
        <span>© 2026 오늘운</span>
        <span className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>∨</span>
      </button>

      {/* 펼친 상태 */}
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-6 pb-8 space-y-6 max-w-xl mx-auto">

          {/* 면책조항 */}
          <div className="rounded-2xl bg-white/4 border border-white/8 px-4 py-3">
            <p className="text-[#a8a6b7]/60 text-[11px] leading-relaxed">
              본 서비스의 AI 운세 해석은 <span className="text-[#f4f0ff]/70">재미와 참고 목적</span>으로 제공됩니다.
              실제 의사결정, 투자, 건강, 법률 등 중요한 사안에 활용하지 마세요.
              운세 결과는 개인의 상황에 따라 다를 수 있습니다.
            </p>
          </div>

          {/* 링크 */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[#a8a6b7]/50">
            <Link href="/about" className="hover:text-[#f4f0ff] transition-colors">서비스 소개</Link>
            <span className="text-[#a8a6b7]/25">·</span>
            <Link href="/terms" className="hover:text-[#f4f0ff] transition-colors">이용약관</Link>
            <span className="text-[#a8a6b7]/25">·</span>
            <Link href="/privacy" className="hover:text-[#f4f0ff] transition-colors">개인정보처리방침</Link>
            <span className="text-[#a8a6b7]/25">·</span>
            <a href="mailto:ters9292@gmail.com" className="hover:text-[#f4f0ff] transition-colors">문의하기</a>
            <span className="text-[#a8a6b7]/25">·</span>
            <a href="https://github.com/riccio-ryu/todays-vibe" target="_blank" rel="noopener noreferrer" className="hover:text-[#f4f0ff] transition-colors">GitHub</a>
          </div>

          <p className="text-center text-[#a8a6b7]/30 text-[11px]">© 2026 오늘운 · All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
