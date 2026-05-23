import { type ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Perfil from "./pages/Perfil";
import Busca from "./pages/Busca";
import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login";
import PostDetalhe from "./pages/PostDetalhe";
import EsqueciSenha from "./pages/EsqueciSenha";
import PerfilPublico from "./pages/PerfilPublico";
import CatalogoDetalhe from "./pages/CatalogoDetalhe";

function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

function RootPage() {
  const { loading } = useAuth();
  if (loading) return null;
  return <PublicLayout><Home /></PublicLayout>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RootPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/busca" element={<PublicLayout><Busca /></PublicLayout>} />
          <Route path="/post/:id" element={<PublicLayout><PostDetalhe /></PublicLayout>} />
          <Route path="/u/:username" element={<PublicLayout><PerfilPublico /></PublicLayout>} />
          <Route path="/catalogo/:id" element={<PublicLayout><CatalogoDetalhe /></PublicLayout>} />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Navbar />
                <main><Perfil /></main>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
