import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

// ========== Types ==========
type Role = string | null;

interface UserInfo {
  id: string | null;
  name: string | null;
  email: string | null;
  role: Role;
}

interface AuthContextType {
  token: string | null;
  user: UserInfo;
  isAuthenticated: boolean;
  login: (token: string, userData?: Partial<UserInfo>) => void;
  logout: () => void;
  refreshFromStorage: () => void;
}

// ========== Utilities ==========

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

function parseJwt(
  token: string
): { id?: string; role?: string; exp?: number } | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isJwtValid(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now();
}

// ========== Context Setup ==========
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();

  // ✅ Synchronous hydration — avoids 401 race
  const initialToken = localStorage.getItem(TOKEN_KEY);
  const initialUserStr = localStorage.getItem(USER_KEY);
  const tokenValid = initialToken && isJwtValid(initialToken);
  const initialPayload = tokenValid ? parseJwt(initialToken!) : null;
  const parsedUser = initialUserStr ? JSON.parse(initialUserStr) : {};

  const [token, setToken] = useState<string | null>(
    tokenValid ? initialToken : null
  );
  const [user, setUser] = useState<UserInfo>({
    id: parsedUser.id ?? initialPayload?.id ?? null,
    name: parsedUser.name ?? null,
    email: parsedUser.email ?? null,
    role: parsedUser.role ?? initialPayload?.role ?? null,
  });

  const refreshFromStorage = () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && isJwtValid(storedToken)) {
      const payload = parseJwt(storedToken);
      const parsed = storedUser ? JSON.parse(storedUser) : {};
      setToken(storedToken);
      setUser({
        id: parsed.id ?? payload?.id ?? null,
        name: parsed.name ?? null,
        email: parsed.email ?? null,
        role: parsed.role ?? payload?.role ?? null,
      });
    } else {
      logout(); // clear expired or invalid token
    }
  };

  const login = (newToken: string, userData?: Partial<UserInfo>) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    if (userData) localStorage.setItem(USER_KEY, JSON.stringify(userData));

    const payload = parseJwt(newToken);
    setToken(newToken);
    setUser({
      id: userData?.id ?? payload?.id ?? null,
      name: userData?.name ?? null,
      email: userData?.email ?? null,
      role: userData?.role ?? payload?.role ?? null,
    });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser({ id: null, name: null, email: null, role: null });
    navigate("/", { replace: true }); // redirect to home
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!(token && isJwtValid(token)),
        login,
        logout,
        refreshFromStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ========== Hook ==========
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
