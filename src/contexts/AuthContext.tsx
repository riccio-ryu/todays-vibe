"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true, isAdmin: false });

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

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
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
      })
      .catch(() => {
        setUser(null);
        setIsAdmin(false);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
