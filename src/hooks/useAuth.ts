import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export type AuthUser = {
  id: number;
  username: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: "user" | "admin";
  theme: "dark" | "light" | "ocean" | "sakura" | "cyber";
};

export function useAuth() {
  const {
    data: rawUser,
    isLoading,
    error,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    window.location.reload();
  }, []);

  const user: AuthUser | null = useMemo(() => {
    if (!rawUser) return null;
    return rawUser as AuthUser;
  }, [rawUser]);

  return useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      isLoading,
      error,
      logout,
    }),
    [user, isLoading, error, logout],
  );
}
