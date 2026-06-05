import { type ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useConfiguracoes } from "./hooks/useConfiguracoes";
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
import Mensagens from "./pages/Mensagens";
import Sobre from "./pages/Sobre";
import Configuracoes from "./pages/Configuracoes";
import ExplorarCatalogos from "./pages/ExplorarCatalogos";
import Notificacoes from "./pages/Notificacoes";
import Artistas from "./pages/Artistas";
import Arte from "./pages/Arte";

function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

function AppTheme() {
  useConfiguracoes();
  return null;
}

function RootPage() {
  const { usuario, loading } = useAuth();
  if (loading) return null;
  if (usuario) return <Navigate to="/home" replace />;
  return <Cadastro />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppTheme />
        <Routes>
          <Route path="/" element={<RootPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Navbar />
                <main><Home /></main>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/busca" element={<PublicLayout><Busca /></PublicLayout>} />
          <Route path="/sobre" element={<PublicLayout><Sobre /></PublicLayout>} />
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
          <Route
            path="/mensagens"
            element={
              <ProtectedRoute>
                <Navbar />
                <main><Mensagens /></main>
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute>
                <Navbar />
                <main><Configuracoes /></main>
              </ProtectedRoute>
            }
          />
          <Route path="/catalogos" element={<PublicLayout><ExplorarCatalogos /></PublicLayout>} />
          <Route path="/arte" element={<PublicLayout><Arte /></PublicLayout>} />
          <Route path="/artistas" element={<PublicLayout><Artistas /></PublicLayout>} />
          <Route
            path="/notificacoes"
            element={
              <ProtectedRoute>
                <Navbar />
                <main><Notificacoes /></main>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
