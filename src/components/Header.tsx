"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/firebase/auth";
import { User, Settings } from "lucide-react";
import PWAInstallButton from "@/components/common/PWAInstallButton";

export default function Header() {
  const { user, loading, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    window.location.href = "/";
  }

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-3 w-[calc(100%-2rem)] max-w-2xl px-4 py-2.5 rounded-full backdrop-blur-xl header-pill">
      {/* Logo */}
      <Link href="/" className="shrink-0">
        <Image
          src="/brand/logo.svg"
          alt="오늘운"
          width={820}
          height={400}
          style={{ width: "72px", height: "auto" }}
          priority
        />
      </Link>

      {/* Auth */}
      <nav className="flex items-center gap-2.5">
        {loading ? (
          <div className="w-7 h-7 rounded-full bg-white/8 animate-pulse" />
        ) : user ? (
          <div ref={menuRef} className="relative flex items-center gap-2">
            <PWAInstallButton />
            {/* 아바타 버튼 */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-white/15 hover:ring-[#9382ff] transition-all focus:outline-none"
            >
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="avatar"
                  width={28}
                  height={28}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-[#9382ff]/60 flex items-center justify-center text-[#f4f0ff] text-xs font-bold">
                  {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
                </div>
              )}
            </button>

            {/* 드롭다운 */}
            {open && (
              <div className="absolute right-0 top-full mt-3 w-52 rounded-[16px] overflow-hidden card-glow">
                <div className="px-4 py-3 border-b border-white/8">
                  <p className="text-[#f4f0ff] text-sm font-medium truncate">
                    {user.displayName ?? "사용자"}
                  </p>
                  <p className="text-[#a8a6b7] text-xs truncate">{user.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/mypage"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#a8a6b7] hover:text-[#f4f0ff] hover:bg-white/5 transition-colors"
                  >
                    <User className="w-3.5 h-3.5" /> 마이페이지
                  </Link>
                  {isAdmin && (
                    <>
                      <div className="border-t border-white/8 my-1" />
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#9382ff] hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5" /> 관리자 페이지
                      </Link>
                    </>
                  )}
                  <div className="border-t border-white/8 my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-[#a8a6b7]/60 hover:bg-white/5 hover:text-[#a8a6b7] transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <PWAInstallButton />
            <Link
              href="/login"
              className="px-3.5 py-1.5 text-sm text-[#a8a6b7] border border-white/15 rounded-[5px] hover:bg-white/8 hover:text-[#f4f0ff] transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="hidden sm:block px-3.5 py-1.5 text-sm text-[#f4f0ff] font-medium bg-[#5046e4] rounded-[5px] hover:bg-[#3d36c4] transition-colors"
            >
              회원가입
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
