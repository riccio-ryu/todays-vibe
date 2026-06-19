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
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-[10px] backdrop-blur-md bg-black/30 border-b border-white/8">
      {/* Logo */}
      <Link href="/">
        <Image
          src="/brand/logo.svg"
          alt="오늘운"
          width={820}
          height={400}
          style={{ width: "80px", height: "auto" }}
          priority
        />
      </Link>

      {/* Auth */}
      <nav className="flex items-center gap-3">
        {loading ? (
          <div className="w-8 h-8 rounded-full bg-white/8 animate-pulse" />
        ) : user ? (
          <div ref={menuRef} className="relative flex items-center gap-2">
            <PWAInstallButton />
            <button
              onClick={() => setOpen((v) => !v)}
              className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/15 hover:ring-[#9382ff] transition-all focus:outline-none"
            >
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="avatar"
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-[#9382ff]/60 flex items-center justify-center text-[#f4f0ff] text-sm font-bold">
                  {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
                </div>
              )}
            </button>

            {/* 드롭다운 */}
            {open && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#060317] border border-white/10 shadow-xl overflow-hidden">
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
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
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
              className="px-4 py-1.5 text-sm text-[#a8a6b7] border border-white/15 rounded-[5px] hover:bg-white/8 hover:text-[#f4f0ff] transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="px-4 py-1.5 text-sm text-[#f4f0ff] font-medium bg-[#9382ff] rounded-[5px] hover:bg-[#7a6be0] transition-colors"
            >
              회원가입
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
