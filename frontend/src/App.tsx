import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Posts from "./pages/Posts";
import Catalogos from "./pages/Catalogos";
import Contato from "./pages/Contato";
import FormCadastro from "./components/FormCadastro";

export default function App() {
  return (
    <Router>
      <div>
        {/* Navbar */}
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

        {/* Conteúdo principal */}
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
    </Router>
  );
}
