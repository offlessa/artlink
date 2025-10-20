// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Perfil from "./pages/Perfil";
import Busca from "./pages/Busca";
import Cadastro from "./pages/Cadastro";

export default function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/busca" element={<Busca />} />
          <Route path="/cadastro" element={<Cadastro />} />
        </Routes>
      </main>
    </Router>
  );
}
