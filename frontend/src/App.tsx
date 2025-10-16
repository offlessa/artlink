import React from "react";
import { Routes, Route, Link } from "react-router-dom";

// Páginas de exemplo
import Home from "./pages/Home";
import Posts from "./pages/Posts";
import Catalogos from "./pages/Catalogos";
import Contato from "./pages/Contato";

// Componente de cadastro
import FormCadastro from "./components/FormCadastro";

export default function App() {
  return (
    <div>
      {/* Navbar simples */}
      <nav
        style={{
          padding: 12,
          borderBottom: "1px solid #ddd",
          display: "flex",
          gap: 12,
        }}
      >
        <Link to="/">Home</Link>
        <Link to="/posts">Posts</Link>
        <Link to="/catalogos">Catálogos</Link>
        <Link to="/contato">Contato</Link>
        <Link to="/cadastro">Cadastro</Link>
      </nav>

      {/* Conteúdo das páginas */}
      <main style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/catalogos" element={<Catalogos />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/cadastro" element={<FormCadastro />} />
        </Routes>
      </main>
    </div>
  );
}
