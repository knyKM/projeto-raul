import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getApiUrl, getApiUrlCandidates } from "./apiClient";

export type UserRole = "atendente" | "supervisor" | "administrador";

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "sistemaleads_token";
const USER_KEY = "sistemaleads_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate token on mount
    if (token) {
      const baseUrl = getApiUrl();
      if (baseUrl) {
        fetch(`${baseUrl}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
          .then(res => res.ok ? res.json() : Promise.reject())
          .then(data => {
            setUser({ id: data.id, nome: data.nome, email: data.email, role: data.role });
            localStorage.setItem(USER_KEY, JSON.stringify({ id: data.id, nome: data.nome, email: data.email, role: data.role }));
          })
          .catch(() => { logout(); })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const candidates = getApiUrlCandidates();
    if (candidates.length === 0) return { ok: false, error: "API não configurada" };

    for (let index = 0; index < candidates.length; index += 1) {
      const baseUrl = candidates[index];
      try {
        const res = await fetch(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          const canTryNext = [404, 502, 503, 504].includes(res.status) && index < candidates.length - 1;
          if (canTryNext) continue;
          return { ok: false, error: data.error || "Erro ao fazer login" };
        }

        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("mogibens_api_url", baseUrl);
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { ok: true };
      } catch {
        if (index < candidates.length - 1) continue;
      }
    }

    return { ok: false, error: "Erro de conexão com o servidor" };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const hasRole = (...roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
