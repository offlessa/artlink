import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "../api/api";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export interface Usuario {
  id: number;
  nome: string;
  username: string;
  email: string;
  bio?: string;
  cidade?: string;
  contato?: string;
  fotoPerfil?: string;
  fotoCapa?: string;
  perfilConfig?: string;
  configuracoes?: string;
  criadoEm: string;
}

interface AuthContextData {
  usuario: Usuario | null;
  token: string | null;
  login: (email: string, senha: string, lembrar?: boolean) => Promise<void>;
  logout: () => void;
  updateUsuario: (data: Partial<Usuario>) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken =
      localStorage.getItem("@artlink:token") ||
      sessionStorage.getItem("@artlink:token");
    const storedUsuario =
      localStorage.getItem("@artlink:usuario") ||
      sessionStorage.getItem("@artlink:usuario");

    if (storedToken && storedUsuario) {
      if (isTokenExpired(storedToken)) {
        localStorage.removeItem("@artlink:token");
        localStorage.removeItem("@artlink:usuario");
        sessionStorage.removeItem("@artlink:token");
        sessionStorage.removeItem("@artlink:usuario");
        setLoading(false);
        return;
      }

      const parsedUsuario: Usuario = JSON.parse(storedUsuario);
      setToken(storedToken);
      setUsuario(parsedUsuario);
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      setLoading(false);

      // Busca dados atualizados em background para sincronizar entre dispositivos
      api.get(`/usuario/${parsedUsuario.id}`)
        .then((res) => {
          const fresh: Usuario = res.data;
          if (fresh) {
            setUsuario(fresh);
            const storage = localStorage.getItem("@artlink:token") ? localStorage : sessionStorage;
            storage.setItem("@artlink:usuario", JSON.stringify(fresh));
          }
        })
        .catch(() => { /* silencioso — interceptor 401 já trata expiração */ });
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, senha: string, lembrar = false) {
    const response = await api.post("/auth/login", { email, senha });
    const { token: newToken, usuario: newUsuario } = response.data.data;

    setToken(newToken);
    setUsuario(newUsuario);
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

    const storage = lembrar ? localStorage : sessionStorage;
    storage.setItem("@artlink:token", newToken);
    storage.setItem("@artlink:usuario", JSON.stringify(newUsuario));
  }

  function updateUsuario(data: Partial<Usuario>) {
    setUsuario((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      const storage = localStorage.getItem("@artlink:token") ? localStorage : sessionStorage;
      storage.setItem("@artlink:usuario", JSON.stringify(updated));
      return updated;
    });
  }

  function logout() {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem("@artlink:token");
    localStorage.removeItem("@artlink:usuario");
    sessionStorage.removeItem("@artlink:token");
    sessionStorage.removeItem("@artlink:usuario");
    delete api.defaults.headers.common["Authorization"];
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        login,
        logout,
        updateUsuario,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
