"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase/config";
import { createSession } from "@/lib/firebase/auth";

export interface SessionUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  // mypage 호환성: uid prefix로 provider 파생
  providerData: { providerId: string }[];
  // mypage 호환성: 가입일은 Firestore에서 별도 조회, 여기선 undefined
  metadata: { creationTime: undefined };
}

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  isAdmin: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAdmin: false,
  refreshAuth: async () => {},
});

function deriveProviderData(uid: string): { providerId: string }[] {
  if (uid.startsWith("google:")) return [{ providerId: "google.com" }];
  if (uid.startsWith("github:")) return [{ providerId: "github.com" }];
  if (uid.startsWith("naver:")) return [{ providerId: "naver.com" }];
  if (uid.startsWith("kakao:")) return [{ providerId: "kakao.com" }];
  return [{ providerId: "password" }];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshAuth = useCallback(async () => {
    try {
      const r = await fetch("/api/auth/me");
      const d = await r.json();
      if (d.loggedIn) {
        const uid: string = d.uid ?? "";
        setUser({
          uid,
          email: d.email ?? null,
          displayName: d.displayName ?? null,
          photoURL: d.photoURL ?? null,
          providerData: deriveProviderData(uid),
          metadata: { creationTime: undefined },
        });
        setIsAdmin(d.isAdmin === true);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    } catch {
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const auth = getAuth(getFirebaseApp());

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firebase Auth에 로그인 상태 — 서버 세션이 만료됐으면 자동 갱신
        try {
          const r = await fetch("/api/auth/me");
          const d = await r.json();
          if (!d.loggedIn) {
            await createSession(firebaseUser);
          }
        } catch {
          // 세션 갱신 실패 시 무시하고 서버 세션 상태만 반영
        }
      }
      await refreshAuth();
    });

    return () => unsubscribe();
  }, [refreshAuth]);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
